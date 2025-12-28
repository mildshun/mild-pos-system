from decimal import Decimal
from typing import List

from pydantic import BaseModel


class TopProduct(BaseModel):
    product_id: int
    name: str
    quantity: int
    total: Decimal


class DailyReport(BaseModel):
    date: str
    order_count: int
    total_amount: Decimal
    top_products: List[TopProduct]
