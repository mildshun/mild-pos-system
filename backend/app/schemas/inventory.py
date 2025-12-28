from datetime import datetime

from pydantic import BaseModel


class InventoryRead(BaseModel):
    product_id: int
    quantity: int
    updated_at: datetime

    class Config:
        from_attributes = True


class InventoryUpdate(BaseModel):
    quantity: int
