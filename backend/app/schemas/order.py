from datetime import datetime
from decimal import Decimal
from typing import List

from pydantic import BaseModel, conint

from app.schemas.product import ProductRead
from app.schemas.user import UserRead


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: conint(gt=0)


class OrderItemRead(BaseModel):
    id: int
    product_id: int
    unit_price: Decimal
    quantity: int
    line_total: Decimal

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]


class OrderRead(BaseModel):
    id: int
    created_by: int
    total_amount: Decimal
    created_at: datetime
    items: List[OrderItemRead]

    class Config:
        from_attributes = True
