from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class ProductBase(BaseModel):
    sku: str
    name: str
    category_id: int
    price: Decimal
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    sku: str | None = None
    name: str | None = None
    category_id: int | None = None
    price: Decimal | None = None
    is_active: bool | None = None


class ProductRead(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
