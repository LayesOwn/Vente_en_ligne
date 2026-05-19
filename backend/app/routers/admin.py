import hmac
import io
import os
import uuid

import aiofiles
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Body
from PIL import Image
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Order, Product, ShopProfile
from ..schemas import StatsOut, ShopProfileOut, ShopProfileUpdate
from ..utils.auth import create_access_token, get_current_admin
from ..utils.security import login_limiter

router = APIRouter(prefix="/api/admin", tags=["admin"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
_ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}


@router.post("/login")
def login(request: Request, password: str = Body(..., embed=True)):
    client_ip = request.client.host if request.client else "unknown"

    if not login_limiter.is_allowed(client_ip):
        retry = login_limiter.retry_after(client_ip)
        raise HTTPException(
            status_code=429,
            detail=f"Trop de tentatives. Réessayez dans {retry} secondes.",
            headers={"Retry-After": str(retry)},
        )

    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")

    # Comparaison en temps constant — évite les attaques par timing
    if not hmac.compare_digest(
        password.encode("utf-8"),
        admin_password.encode("utf-8"),
    ):
        raise HTTPException(status_code=401, detail="Mot de passe incorrect")

    return {"access_token": create_access_token(), "token_type": "bearer"}


@router.get("/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    total_orders = db.query(Order).count()
    total_revenue = (
        db.query(func.sum(Order.total)).filter(Order.status != "annulee").scalar() or 0.0
    )
    total_products = db.query(Product).count()
    pending_orders = db.query(Order).filter(Order.status == "en_attente").count()

    return StatsOut(
        total_orders=total_orders,
        total_revenue=total_revenue,
        total_products=total_products,
        pending_orders=pending_orders,
    )


@router.post("/upload")
async def upload_image(file: UploadFile = File(...), _: str = Depends(get_current_admin)):
    # 1. Vérification du Content-Type déclaré
    if file.content_type not in _ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Type de fichier non supporté. Utilisez JPG, PNG, WEBP ou GIF.",
        )

    # 2. Vérification de l'extension
    raw_name = file.filename or ""
    ext = raw_name.rsplit(".", 1)[-1].lower() if "." in raw_name else ""
    if ext not in _ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Extension non supportée. Utilisez .jpg, .png, .webp ou .gif.",
        )

    # 3. Lecture et vérification de la taille
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux. Maximum 5 Mo.")

    # 4. Vérification des magic bytes via Pillow — détecte les fichiers déguisés
    try:
        with Image.open(io.BytesIO(contents)) as img:
            img.verify()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Le fichier n'est pas une image valide ou est corrompu.",
        )

    # 5. Sauvegarde avec nom aléatoire (pas de path traversal possible)
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(contents)

    return {"url": f"/uploads/{filename}", "filename": filename}


@router.get("/profile", response_model=ShopProfileOut)
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(ShopProfile).filter(ShopProfile.id == 1).first()
    if not profile:
        return ShopProfileOut()
    return profile


@router.put("/profile", response_model=ShopProfileOut)
def update_profile(data: ShopProfileUpdate, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    profile = db.query(ShopProfile).filter(ShopProfile.id == 1).first()
    if not profile:
        profile = ShopProfile(id=1)
        db.add(profile)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile
