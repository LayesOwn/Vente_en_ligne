from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, selectinload
from typing import List
import io

from ..database import get_db
from ..models import Order, OrderItem, Product
from ..schemas import OrderCreate, OrderOut, OrderStatusUpdate
from ..utils.pdf import generate_invoice_pdf
from ..utils.telegram import send_order_notification, build_order_message
from ..utils.auth import get_current_admin
from ..utils.security import order_limiter

router = APIRouter(prefix="/api/orders", tags=["orders"])

# Chargement des relations en une requête groupée (évite le N+1)
_WITH_ITEMS = selectinload(Order.items).selectinload(OrderItem.product)


@router.post("", response_model=OrderOut, status_code=201)
async def create_order(
    order: OrderCreate,
    background_tasks: BackgroundTasks,
    request: Request,
    db: Session = Depends(get_db),
):
    # Anti-spam : limite le nombre de commandes par IP
    client_ip = request.client.host if request.client else "unknown"
    if not order_limiter.is_allowed(client_ip):
        retry = order_limiter.retry_after(client_ip)
        raise HTTPException(
            status_code=429,
            detail=f"Trop de commandes envoyées. Réessayez dans {retry} secondes.",
            headers={"Retry-After": str(retry)},
        )

    if not order.items:
        raise HTTPException(status_code=400, detail="La commande ne contient aucun article")

    # Charger tous les produits demandés en une requête, avec verrou (anti-survente)
    product_ids = {item.product_id for item in order.items}
    query = db.query(Product).filter(Product.id.in_(product_ids))
    # with_for_update verrouille les lignes jusqu'au commit (no-op sur SQLite)
    if db.bind.dialect.name != "sqlite":
        query = query.with_for_update()
    products: dict[int, Product] = {p.id: p for p in query.all()}

    # Valider existence et stock
    for item in order.items:
        product = products.get(item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Produit {item.product_id} introuvable")
        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail="Quantité invalide")
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuffisant pour {product.name}: {product.stock} disponible(s)",
            )

    # Calculer le total côté serveur depuis les prix en base
    real_total = sum(products[item.product_id].price * item.quantity for item in order.items)

    # Créer la commande avec le total vérifié
    db_order = Order(
        customer_name=order.customer_name,
        phone=order.phone,
        city=order.city,
        payment_method=order.payment_method,
        total=real_total,
    )
    db.add(db_order)
    db.flush()

    # Créer les articles et déduire le stock
    for item in order.items:
        product = products[item.product_id]
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=product.price,
        )
        db.add(db_item)
        product.stock -= item.quantity

    db.commit()
    db.refresh(db_order)

    message = build_order_message(db_order)
    background_tasks.add_task(send_order_notification, message)

    return db_order


@router.get("", response_model=List[OrderOut])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    return (
        db.query(Order)
        .options(_WITH_ITEMS)
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ── Suivi public par jeton (le client n'est pas authentifié) ───────────────────
@router.get("/track/{token}", response_model=OrderOut)
def track_order(token: str, db: Session = Depends(get_db)):
    order = db.query(Order).options(_WITH_ITEMS).filter(Order.public_token == token).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    return order


@router.get("/track/{token}/invoice")
def download_invoice_public(token: str, db: Session = Depends(get_db)):
    order = db.query(Order).options(_WITH_ITEMS).filter(Order.public_token == token).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    pdf_buffer = generate_invoice_pdf(order)
    return StreamingResponse(
        io.BytesIO(pdf_buffer),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=facture-DASHA-{order.id:04d}.pdf"},
    )


# ── Accès par ID réservé à l'admin (IDs séquentiels devinables) ────────────────
@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    order = db.query(Order).options(_WITH_ITEMS).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    return order


@router.put("/{order_id}/status", response_model=OrderOut)
def update_order_status(order_id: int, status_update: OrderStatusUpdate, db: Session = Depends(get_db), _: str = Depends(get_current_admin)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")

    valid_statuses = ["en_attente", "confirmee", "en_livraison", "livree", "annulee"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Statut invalide. Valeurs acceptées: {valid_statuses}")

    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order
