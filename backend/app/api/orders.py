from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from fastapi import Query
from sqlalchemy.orm import Session

from app.core import deps
from app.schemas.order import OrderCreate, OrderRead
from app.services.order_service import OrderService

router = APIRouter(prefix="/api/orders", tags=["orders"])
cashier_or_admin = deps.require_role({"cashier", "admin"})
admin_required = deps.require_role({"admin"})


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, current_user=Depends(cashier_or_admin), db: Session = Depends(deps.get_db_session)):
    order = OrderService(db).create_order(created_by=current_user.id, payload=payload)
    return order


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int, current_user=Depends(cashier_or_admin), db: Session = Depends(deps.get_db_session)):
    order = OrderService(db).get(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


@router.get("", response_model=list[OrderRead])
def list_orders(
    current_user=Depends(cashier_or_admin),
    db: Session = Depends(deps.get_db_session),
    from_date: datetime | None = Query(default=None),
    to_date: datetime | None = Query(default=None),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
):
    return OrderService(db).list(from_date=from_date, to_date=to_date, limit=limit, offset=offset)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(admin_required)])
def delete_order(order_id: int, db: Session = Depends(deps.get_db_session)):
    ok = OrderService(db).delete(order_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return None
