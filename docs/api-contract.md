# API Contract

Base URL: `http://localhost:8000/api`

## Auth
- `POST /auth/login` -> `{ access_token, token_type, expires_at, user }`
- `GET /auth/me` (bearer required)

## Categories (admin)
- `GET /categories`
- `POST /categories`
- `DELETE /categories/{id}` (soft delete)

## Products
- `GET /products?query=&category_id=`
- `POST /products` (admin)
- `GET /products/{id}`
- `PATCH /products/{id}` (admin)
- `DELETE /products/{id}` (admin)

## Inventory (admin)
- `GET /inventory`
- `PATCH /inventory/{product_id}` body `{ "quantity": <int> }`

## Orders
- `POST /orders` (cashier/admin) body `{ items: [{ product_id, quantity }] }`
- `GET /orders` (cashier/admin) optional `from`, `to`, `limit`, `offset`
- `GET /orders/{id}` (cashier/admin)

## Reports (admin)
- `GET /reports/daily?date=YYYY-MM-DD`

Error responses align with FastAPI defaults (401 unauth, 403 forbidden, 404 missing, 409 conflicts).
