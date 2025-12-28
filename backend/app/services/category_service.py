from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryService:
    def __init__(self, db: Session):
        self.db = db

    def list(self):
        return self.db.query(Category).order_by(Category.id).all()

    def create(self, payload: CategoryCreate) -> Category:
        category = Category(name=payload.name, is_active=payload.is_active)
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    def get(self, category_id: int) -> Category | None:
        return self.db.query(Category).filter(Category.id == category_id).first()

    def update(self, category_id: int, payload: CategoryUpdate) -> Category | None:
        category = self.get(category_id)
        if not category:
            return None
        for field, value in payload.dict(exclude_unset=True).items():
            setattr(category, field, value)
        self.db.commit()
        self.db.refresh(category)
        return category

    def soft_delete(self, category_id: int) -> bool:
        category = self.get(category_id)
        if not category:
            return False
        category.is_active = False
        self.db.commit()
        return True
