from decimal import Decimal
from typing import List, Optional
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.inventory import Inventory
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate


class OrderService:
    def __init__(self, db: Session):
        self.db = db

    def create_order(self, created_by: int, payload: OrderCreate) -> Order:
        if not payload.items:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No items provided")

        product_ids = [item.product_id for item in payload.items]
        products = {p.id: p for p in self.db.query(Product).filter(Product.id.in_(product_ids)).all()}
        inventories = {
            inv.product_id: inv for inv in self.db.query(Inventory).filter(Inventory.product_id.in_(product_ids)).all()
        }

        order_items: List[OrderItem] = []
        total_amount = Decimal("0.00")

        for item in payload.items:
            product = products.get(item.product_id)
            if not product or not product.is_active:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {item.product_id} not found")
            inventory = inventories.get(item.product_id)
            available_qty = inventory.quantity if inventory else 0
            if item.quantity > available_qty:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Insufficient stock for product {item.product_id}",
                )

            line_total = Decimal(product.price) * item.quantity
            total_amount += line_total
            order_items.append(
                OrderItem(
                    product_id=item.product_id,
                    unit_price=product.price,
                    quantity=item.quantity,
                    line_total=line_total,
                )
            )

        order = Order(created_by=created_by, total_amount=total_amount, items=[])
        self.db.add(order)
        self.db.flush()

        for order_item in order_items:
            order_item.order_id = order.id
            self.db.add(order_item)
            order.items.append(order_item)
            inv = inventories.get(order_item.product_id)
            if inv:
                inv.quantity -= order_item.quantity
            else:
                # inventory record missing; treat as zero stock
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Inventory missing for product {order_item.product_id}",
                )

        self.db.commit()
        self.db.refresh(order)
        return order

    def get(self, order_id: int) -> Order | None:
        from sqlalchemy.orm import selectinload

        return (
            self.db.query(Order)
            .options(selectinload(Order.items))
            .filter(Order.id == order_id)
            .first()
        )

    def list(
        self,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> List[Order]:
        from sqlalchemy.orm import selectinload

        query = self.db.query(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc())
        if from_date:
            query = query.filter(Order.created_at >= from_date)
        if to_date:
            query = query.filter(Order.created_at <= to_date)
        return query.offset(offset).limit(limit).all()

    def delete(self, order_id: int) -> bool:
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return False
        self.db.delete(order)
        self.db.commit()
        return True
