from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr

Role = Literal["admin", "cashier"]


class UserBase(BaseModel):
    email: EmailStr
    role: Role
    is_active: bool


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Role


class UserRead(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
