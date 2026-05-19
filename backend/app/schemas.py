from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ─── Product Schemas ───────────────────────────────────────────────────────────

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    category: str
    image: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    image: Optional[str] = None


class ProductOut(ProductBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Order Schemas ─────────────────────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    price: float


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: Optional[ProductOut] = None

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    customer_name: str
    phone: str
    city: str
    payment_method: str
    total: float
    items: List[OrderItemCreate]


class OrderStatusUpdate(BaseModel):
    status: str


class OrderOut(BaseModel):
    id: int
    customer_name: str
    phone: str
    city: str
    payment_method: str
    total: float
    status: str
    created_at: datetime
    items: List[OrderItemOut] = []

    model_config = {"from_attributes": True}


# ─── Stats Schema ──────────────────────────────────────────────────────────────

class StatsOut(BaseModel):
    total_orders: int
    total_revenue: float
    total_products: int
    pending_orders: int


# ─── Shop Profile Schema ───────────────────────────────────────────────────────

class ShopProfileOut(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    tiktok: Optional[str] = None

    model_config = {"from_attributes": True}


class ShopProfileUpdate(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    tiktok: Optional[str] = None
