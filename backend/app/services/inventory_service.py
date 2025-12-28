from sqlalchemy.orm import Session

from app.models.inventory import Inventory
from app.schemas.inventory import InventoryUpdate


class InventoryService:
    def __init__(self, db: Session):
        self.db = db

    def list(self):
        return self.db.query(Inventory).all()

    def get(self, product_id: int) -> Inventory | None:
        return self.db.query(Inventory).filter(Inventory.product_id == product_id).first()

    def upsert_quantity(self, product_id: int, payload: InventoryUpdate) -> Inventory:
        record = self.get(product_id)
        if not record:
            record = Inventory(product_id=product_id, quantity=payload.quantity)
            self.db.add(record)
        else:
            record.quantity = payload.quantity
        self.db.commit()
        self.db.refresh(record)
        return record
