from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
import uuid
import aiofiles

from ..database import get_db
from ..models import Order, Product
from ..schemas import StatsOut

router = APIRouter(prefix="/api/admin", tags=["admin"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")


@router.get("/stats", response_model=StatsOut)
def get_stats(db: Session = Depends(get_db)):
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.sum(Order.total)).filter(Order.status != "annulee").scalar() or 0.0
    total_products = db.query(Product).count()
    pending_orders = db.query(Order).filter(Order.status == "en_attente").count()

    return StatsOut(
        total_orders=total_orders,
        total_revenue=total_revenue,
        total_products=total_products,
        pending_orders=pending_orders,
    )


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Type de fichier non supporté. Utilisez JPG, PNG, WEBP ou GIF.")

    # Limite 5 MB
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux. Maximum 5 MB.")

    ext = file.filename.split(".")[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(contents)

    return {"url": f"/uploads/{filename}", "filename": filename}
