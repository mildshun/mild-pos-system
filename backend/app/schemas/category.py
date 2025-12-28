from datetime import datetime

from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = None
    is_active: bool | None = None


class CategoryRead(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
