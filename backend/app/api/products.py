from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core import deps
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.services.product_service import ProductService

router = APIRouter(prefix="/api/products", tags=["products"])
admin_required = deps.require_role({"admin"})
viewer_required = deps.require_role({"admin", "cashier"})


@router.get("", response_model=list[ProductRead], dependencies=[Depends(viewer_required)])
def list_products(
    query: str | None = Query(default=None),
    category_id: int | None = Query(default=None),
    db: Session = Depends(deps.get_db_session),
):
    return ProductService(db).list(query=query, category_id=category_id)


@router.get("/{product_id}", response_model=ProductRead, dependencies=[Depends(viewer_required)])
def get_product(product_id: int, db: Session = Depends(deps.get_db_session)):
    product = ProductService(db).get(product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.post("", response_model=ProductRead, dependencies=[Depends(admin_required)])
def create_product(payload: ProductCreate, db: Session = Depends(deps.get_db_session)):
    return ProductService(db).create(payload)


@router.patch("/{product_id}", response_model=ProductRead, dependencies=[Depends(admin_required)])
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(deps.get_db_session)):
    product = ProductService(db).update(product_id, payload)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(admin_required)])
def delete_product(product_id: int, db: Session = Depends(deps.get_db_session)):
    ok = ProductService(db).soft_delete(product_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return None
