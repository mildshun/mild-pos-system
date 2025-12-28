from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core import deps
from app.core.security import create_access_token
from app.schemas.auth import LoginRequest, LoginResponse
from app.schemas.user import UserRead
from app.services.user_service import UserService

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(deps.get_db_session)):
    service = UserService(db)
    user = service.authenticate(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token, expires_at = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer", "expires_at": expires_at, "user": UserRead.model_validate(user)}


@router.get("/me", response_model=UserRead)
def me(current_user=Depends(deps.get_current_user)):
    return current_user
