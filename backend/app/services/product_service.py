from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from app.models.inventory import Inventory


class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def list(self, query: str | None = None, category_id: int | None = None):
        q = self.db.query(Product).filter(Product.is_active.is_(True))
        if query:
            like = f"%{query}%"
            q = q.filter(Product.name.ilike(like))
        if category_id:
            q = q.filter(Product.category_id == category_id)
        return q.order_by(Product.id).all()

    def get(self, product_id: int) -> Product | None:
        return self.db.query(Product).filter(Product.id == product_id).first()

    def create(self, payload: ProductCreate) -> Product:
        product = Product(
            sku=payload.sku,
            name=payload.name,
            category_id=payload.category_id,
            price=payload.price,
            is_active=payload.is_active,
        )
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    def update(self, product_id: int, payload: ProductUpdate) -> Product | None:
        product = self.get(product_id)
        if not product:
            return None
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(product, field, value)
        self.db.commit()
        self.db.refresh(product)
        return product

    def soft_delete(self, product_id: int) -> bool:
        product = self.get(product_id)
        if not product:
            return False
        product.is_active = False
        inv = self.db.query(Inventory).filter(Inventory.product_id == product_id).first()
        if inv:
            self.db.delete(inv)
        self.db.commit()
        return True
