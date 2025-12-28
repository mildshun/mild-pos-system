from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import UserCreate


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def create_user(self, user_in: UserCreate) -> User:
        user = User(
            email=user_in.email,
            role=user_in.role,
            password_hash=hash_password(user_in.password),
            is_active=True,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def authenticate(self, email: str, password: str) -> User | None:
        user = self.get_user_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            return None
        return user
