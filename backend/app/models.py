from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base


def _now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    category = Column(String(100), nullable=False)
    image = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=_now)

    order_items = relationship("OrderItem", back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(200), nullable=False)
    phone = Column(String(20), nullable=False)
    city = Column(String(100), nullable=False)
    payment_method = Column(String(50), nullable=False)
    total = Column(Float, nullable=False)
    status = Column(String(50), default="en_attente")
    created_at = Column(DateTime, default=_now)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
