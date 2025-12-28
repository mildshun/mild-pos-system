import pytest
from fastapi import HTTPException

from app.services.order_service import OrderService
from app.schemas.order import OrderCreate, OrderItemCreate


def test_create_order_decrements_inventory_and_totals(db_session, seed_data):
    service = OrderService(db_session)
    payload = OrderCreate(items=[OrderItemCreate(product_id=seed_data["product"].id, quantity=2)])

    order = service.create_order(created_by=seed_data["cashier"].id, payload=payload)

    db_session.refresh(seed_data["inventory"])
    assert float(order.total_amount) == pytest.approx(3.98)
    assert seed_data["inventory"].quantity == 8
    assert len(order.items) == 1
    assert order.items[0].quantity == 2


def test_create_order_fails_on_insufficient_stock(db_session, seed_data):
    service = OrderService(db_session)
    payload = OrderCreate(items=[OrderItemCreate(product_id=seed_data["product"].id, quantity=20)])

    with pytest.raises(HTTPException) as exc:
        service.create_order(created_by=seed_data["cashier"].id, payload=payload)
    assert exc.value.status_code == 409
