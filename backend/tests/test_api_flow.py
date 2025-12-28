from fastapi.testclient import TestClient

from app.core.security import hash_password
from app.models import Category, Inventory, Product, User


def prepare_api_data(db_session):
    admin = User(
        email="admin@test.dev",
        role="admin",
        password_hash=hash_password("adminpass"),
        is_active=True,
    )
    cashier = User(
        email="cashier@test.dev",
        role="cashier",
        password_hash=hash_password("cashierpass"),
        is_active=True,
    )
    db_session.add_all([admin, cashier])
    db_session.flush()

    cat = Category(name="Beverages", is_active=True)
    db_session.add(cat)
    db_session.flush()

    product = Product(sku="BEV-001", name="Coffee", category_id=cat.id, price=3.5, is_active=True)
    db_session.add(product)
    db_session.flush()

    inventory = Inventory(product_id=product.id, quantity=5)
    db_session.add(inventory)
    db_session.commit()
    return {"admin": admin, "cashier": cashier, "product": product, "inventory": inventory}


def test_login_and_create_order_flow(client: TestClient, db_session):
    data = prepare_api_data(db_session)

    res = client.post(
        "/api/auth/login",
        json={"email": data["cashier"].email, "password": "cashierpass"},
    )
    assert res.status_code == 200
    token = res.json()["access_token"]

    res = client.post(
        "/api/orders",
        json={"items": [{"product_id": data["product"].id, "quantity": 2}]},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["total_amount"] == "7.00"
    assert body["items"][0]["quantity"] == 2

    # ensure inventory updated
    res_inv = client.get("/api/inventory", headers={"Authorization": f"Bearer {token}"})
    assert res_inv.status_code == 403  # cashier cannot access inventory

    db_session.refresh(data["inventory"])
    assert data["inventory"].quantity == 3
