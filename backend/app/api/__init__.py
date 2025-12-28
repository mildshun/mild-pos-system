"""API routers package."""

from fastapi import APIRouter

from app.api import health, auth, categories, products, inventory, orders, reports

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(categories.router)
api_router.include_router(products.router)
api_router.include_router(inventory.router)
api_router.include_router(orders.router)
api_router.include_router(reports.router)
