from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core import deps
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate
from app.services.category_service import CategoryService

router = APIRouter(prefix="/api/categories", tags=["categories"])
admin_required = deps.require_role({"admin"})
viewer_required = deps.require_role({"admin", "cashier"})


@router.get("", response_model=list[CategoryRead], dependencies=[Depends(viewer_required)])
def list_categories(db: Session = Depends(deps.get_db_session)):
    return CategoryService(db).list()


@router.post("", response_model=CategoryRead, dependencies=[Depends(admin_required)])
def create_category(payload: CategoryCreate, db: Session = Depends(deps.get_db_session)):
    return CategoryService(db).create(payload)


@router.patch("/{category_id}", response_model=CategoryRead, dependencies=[Depends(admin_required)])
def update_category(category_id: int, payload: CategoryUpdate, db: Session = Depends(deps.get_db_session)):
    category = CategoryService(db).update(category_id, payload)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(admin_required)])
def delete_category(category_id: int, db: Session = Depends(deps.get_db_session)):
    ok = CategoryService(db).soft_delete(category_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return None
