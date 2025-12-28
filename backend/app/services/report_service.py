from datetime import date, datetime
from decimal import Decimal
from typing import List

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.report import DailyReport, TopProduct


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def daily(self, target_date: date) -> DailyReport:
        start = datetime.combine(target_date, datetime.min.time())
        end = datetime.combine(target_date, datetime.max.time())

        order_stats = (
            self.db.query(
                func.count(Order.id).label("order_count"),
                func.coalesce(func.sum(Order.total_amount), 0).label("total_amount"),
            )
            .filter(Order.created_at >= start, Order.created_at <= end)
            .one()
        )

        top_products_rows = (
            self.db.query(
                OrderItem.product_id,
                Product.name,
                func.coalesce(func.sum(OrderItem.quantity), 0).label("quantity"),
                func.coalesce(func.sum(OrderItem.line_total), 0).label("total"),
            )
            .join(Product, Product.id == OrderItem.product_id)
            .join(Order, Order.id == OrderItem.order_id)
            .filter(Order.created_at >= start, Order.created_at <= end)
            .group_by(OrderItem.product_id, Product.name)
            .order_by(func.sum(OrderItem.quantity).desc())
            .limit(5)
            .all()
        )

        top_products: List[TopProduct] = [
            TopProduct(
                product_id=row.product_id,
                name=row.name,
                quantity=row.quantity,
                total=Decimal(row.total),
            )
            for row in top_products_rows
        ]

        return DailyReport(
            date=target_date.isoformat(),
            order_count=order_stats.order_count or 0,
            total_amount=Decimal(order_stats.total_amount or 0),
            top_products=top_products,
        )
