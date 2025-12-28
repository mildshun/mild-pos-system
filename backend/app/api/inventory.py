from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core import deps
from app.schemas.inventory import InventoryRead, InventoryUpdate
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/api/inventory", tags=["inventory"])
admin_required = deps.require_role({"admin"})


@router.get("", response_model=list[InventoryRead], dependencies=[Depends(admin_required)])
def list_inventory(db: Session = Depends(deps.get_db_session)):
    return InventoryService(db).list()


@router.patch("/{product_id}", response_model=InventoryRead, dependencies=[Depends(admin_required)])
def update_inventory(product_id: int, payload: InventoryUpdate, db: Session = Depends(deps.get_db_session)):
    if payload.quantity < 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Quantity must be non-negative")
    return InventoryService(db).upsert_quantity(product_id, payload)
