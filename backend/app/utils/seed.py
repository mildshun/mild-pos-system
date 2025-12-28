"""
Seed initial data for local development.

Usage:
    python -m app.utils.seed
"""
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.category import Category
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.user import User


def seed(db: Session):
    admin = db.query(User).filter(User.email == "admin@local.dev").first()
    cashier = db.query(User).filter(User.email == "cashier@local.dev").first()
    if not admin:
        admin = User(
            email="admin@local.dev",
            role="admin",
            password_hash=hash_password("admin1234"),
            is_active=True,
        )
        db.add(admin)
    if not cashier:
        cashier = User(
            email="cashier@local.dev",
            role="cashier",
            password_hash=hash_password("cashier1234"),
            is_active=True,
        )
        db.add(cashier)

    categories = ["Beverages", "Snacks", "Essentials"]
    category_objs = {}
    for name in categories:
        cat = db.query(Category).filter(Category.name == name).first()
        if not cat:
            cat = Category(name=name, is_active=True)
            db.add(cat)
            db.flush()
        category_objs[name] = cat

    products = [
        ("BEV-001", "Coffee", "Beverages", Decimal("3.50")),
        ("BEV-002", "Tea", "Beverages", Decimal("2.75")),
        ("BEV-003", "Orange Juice", "Beverages", Decimal("4.00")),
        ("SNK-001", "Chips", "Snacks", Decimal("1.99")),
        ("SNK-002", "Chocolate Bar", "Snacks", Decimal("1.50")),
        ("SNK-003", "Granola Bar", "Snacks", Decimal("1.25")),
        ("ESS-001", "Milk", "Essentials", Decimal("2.10")),
        ("ESS-002", "Bread", "Essentials", Decimal("2.50")),
        ("ESS-003", "Eggs", "Essentials", Decimal("3.20")),
        ("ESS-004", "Butter", "Essentials", Decimal("3.80")),
    ]

    for sku, name, cat_name, price in products:
        prod = db.query(Product).filter(Product.sku == sku).first()
        if not prod:
            prod = Product(
                sku=sku,
                name=name,
                category_id=category_objs[cat_name].id,
                price=price,
                is_active=True,
            )
            db.add(prod)
            db.flush()
        inventory = db.query(Inventory).filter(Inventory.product_id == prod.id).first()
        if not inventory:
            inventory = Inventory(product_id=prod.id, quantity=50)
            db.add(inventory)

    db.commit()
    print("Seed data applied.")


if __name__ == "__main__":
    with SessionLocal() as session:
        seed(session)
