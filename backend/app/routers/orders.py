from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import io

from ..database import get_db
from ..models import Order, OrderItem, Product
from ..schemas import OrderCreate, OrderOut, OrderStatusUpdate
from ..utils.pdf import generate_invoice_pdf

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("/", response_model=OrderOut, status_code=201)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    # Vérifier le stock pour chaque article
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Produit {item.product_id} introuvable")
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuffisant pour {product.name}: {product.stock} disponible(s)",
            )

    # Créer la commande
    db_order = Order(
        customer_name=order.customer_name,
        phone=order.phone,
        city=order.city,
        payment_method=order.payment_method,
        total=order.total,
    )
    db.add(db_order)
    db.flush()

    # Créer les articles et déduire le stock
    for item in order.items:
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price,
        )
        db.add(db_item)

        product = db.query(Product).filter(Product.id == item.product_id).first()
        product.stock -= item.quantity

    db.commit()
    db.refresh(db_order)
    return db_order


@router.get("/", response_model=List[OrderOut])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Order).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    return order


@router.put("/{order_id}/status", response_model=OrderOut)
def update_order_status(order_id: int, status_update: OrderStatusUpdate, db: Session = Depends(get_db)):
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


@router.get("/{order_id}/invoice")
def download_invoice(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")

    pdf_buffer = generate_invoice_pdf(order)

    return StreamingResponse(
        io.BytesIO(pdf_buffer),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=facture-DASHA-{order_id}.pdf"},
    )
