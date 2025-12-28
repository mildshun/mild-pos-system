# AGENT.md — Codex Agent Guide (codex-pos)

You are an engineering agent working inside a monorepo that contains:
- **Frontend:** Next.js + TailwindCSS
- **Backend:** FastAPI
- **DB:** PostgreSQL
- **Dev orchestration:** Docker Compose

Your job is to implement a clean, portfolio-grade POS system with strong structure, tests, and documentation. Favor correctness, clarity, and maintainability over “cool” features.

---

## 0) Non-negotiables (Portfolio Quality Bar)

- Monorepo separation: **frontend/** and **backend/** are isolated projects.
- Everything runs locally with: `docker compose up --build`
- Backend must have:
  - alembic migrations
  - structured logs
  - input validation (Pydantic)
  - JWT auth + RBAC
  - tests for core logic + at least a couple API tests
- Frontend must have:
  - auth flow (login)
  - protected routes
  - basic CRUD UI and clean UX states (loading/error/empty)
- Include docs:
  - architecture overview
  - API contract summary
  - ER diagram (can be markdown table / ASCII for now)

If you’re unsure, choose the simplest robust implementation.

---

## 1) Repo Structure (Create if missing)

codex-pos/
├── frontend/
├── backend/
├── infra/
│ └── docker-compose.yml
├── docs/
│ ├── architecture.md
│ ├── api-contract.md
│ └── erd.md
├── .env.example
└── README.md

Keep frontend and backend READMEs too, but root README is the primary entry point.

---

## 2) Tech Decisions (Do NOT change unless required)

### Frontend
- Next.js (App Router)
- TailwindCSS
- Fetch via `fetch()` to backend (no heavy client libs unless needed)
- Minimal UI components (no need for shadcn unless requested)

### Backend
- FastAPI
- SQLAlchemy 2.0 style
- Alembic for migrations
- PostgreSQL
- JWT auth (access token)
- Pytest for tests

---

## 3) Domain Scope (MVP)

### Roles
- `admin`: can manage products, inventory, users, view reports
- `cashier`: can create orders, view products, view today’s summary

### Entities (MVP)
- User
- Product
- Category
- Inventory (stock qty per product)
- Order
- OrderItem

### MVP Features
- Auth: login + token storage (frontend)
- Admin: CRUD products, categories; update inventory
- Cashier: create order with multiple items; order total computed server-side
- Reports: daily sales summary endpoint (today) + simple UI

Avoid payment gateway integration; use “cash” as a simple payment method for MVP.

---

## 4) API Contract (Stable)

Base URL: `http://localhost:8000/api`

### Auth
- `POST /api/auth/login`
  - body: `{ "email": "x", "password": "y" }`
  - returns: `{ "access_token": "...", "token_type": "bearer", "user": { ... } }`
- `GET /api/auth/me` (auth required)
  - returns current user

### Categories (admin)
- `GET /api/categories`
- `POST /api/categories`
- `PATCH /api/categories/{id}`
- `DELETE /api/categories/{id}` (soft-delete preferred)

### Products
- `GET /api/products?query=&category_id=&limit=&offset=`
- `POST /api/products` (admin)
- `GET /api/products/{id}`
- `PATCH /api/products/{id}` (admin)
- `DELETE /api/products/{id}` (admin; soft-delete preferred)

### Inventory (admin)
- `GET /api/inventory`
- `PATCH /api/inventory/{product_id}`
  - body: `{ "quantity": 123 }`

### Orders
- `POST /api/orders` (cashier/admin)
  - body:
    ```
    {
      "items": [
        { "product_id": 1, "quantity": 2 },
        { "product_id": 9, "quantity": 1 }
      ]
    }
    ```
  - Backend computes price snapshot, line totals, order total, decrements inventory in a DB transaction.
- `GET /api/orders?from=YYYY-MM-DD&to=YYYY-MM-DD&limit=&offset=` (admin)
- `GET /api/orders/{id}`

### Reports
- `GET /api/reports/daily?date=YYYY-MM-DD` (admin)
  - returns totals, order_count, top_products

**RBAC Rule:** enforce permissions server-side using role checks.

---

## 5) Data Model (ERD summary)

### User
- id (pk)
- email (unique)
- password_hash
- role (`admin` | `cashier`)
- is_active
- created_at

### Category
- id
- name (unique)
- is_active
- created_at

### Product
- id
- sku (unique)
- name
- category_id (fk)
- price (numeric)
- is_active
- created_at

### Inventory
- product_id (pk, fk)
- quantity (int, >= 0)
- updated_at

### Order
- id
- created_by (fk user)
- total_amount (numeric)
- created_at

### OrderItem
- id
- order_id (fk)
- product_id (fk)
- unit_price (numeric)  // snapshot at purchase time
- quantity (int)
- line_total (numeric)

Constraints:
- quantity must be positive
- inventory cannot drop below 0
- order creation is transactional

---

## 6) Backend Implementation Guidelines

### Backend layout (recommended)

backend/
├── app/
│ ├── main.py
│ ├── core/ # settings, security, deps
│ ├── db/ # session, base, migrations hooks
│ ├── models/ # SQLAlchemy models
│ ├── schemas/ # Pydantic schemas
│ ├── services/ # business logic (important)
│ ├── api/ # routers
│ └── utils/
├── alembic/
├── tests/
└── pyproject.toml


### Patterns
- Put business logic in `services/` not in routers.
- Routers do: auth/role checks, request parsing, call service, return response.
- Use SQLAlchemy 2.0 sessions with dependency injection.
- Use alembic to generate & apply migrations.
- Use UTC timestamps.
- Use numeric types for money (Decimal), avoid float.

### Error handling
Return consistent errors:
- 401 for unauth
- 403 for forbidden
- 404 not found
- 409 conflict (e.g., insufficient stock)
- 422 validation error (handled by FastAPI)

### Security
- Store password with bcrypt.
- JWT with expiration.
- Do not log secrets.

---

## 7) Frontend Implementation Guidelines

### Frontend layout (recommended)

frontend/
├── app/
│ ├── (auth)/login/
│ ├── dashboard/
│ ├── products/
│ ├── categories/
│ ├── orders/
│ ├── reports/
│ └── layout.tsx
├── lib/
│ ├── api.ts # fetch wrapper
│ ├── auth.ts # token helpers
│ └── types.ts
└── middleware.ts # route protection (optional)


### Frontend rules
- Keep API calls in `lib/api.ts`.
- Use env var `NEXT_PUBLIC_API_BASE_URL`.
- Handle loading/error/empty states.
- Basic UX: search products, add items to cart, submit order.

Auth approach:
- store access token in memory or localStorage for MVP (document trade-off).
- attach `Authorization: Bearer <token>` on requests.

---

## 8) Docker & Local Dev

### Required services
- postgres
- backend (FastAPI)
- frontend (Next.js)

Compose should expose:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Postgres: `localhost:5432`

### Environment
Create `.env.example` in repo root with:
- `POSTGRES_DB=codex_pos`
- `POSTGRES_USER=codex`
- `POSTGRES_PASSWORD=codex`
- `POSTGRES_PORT=5432`
- `BACKEND_PORT=8000`
- `FRONTEND_PORT=3000`
- `JWT_SECRET=change-me`
- `JWT_EXPIRES_MINUTES=60`
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`

Backend should read from env (Pydantic Settings). Frontend reads Next public env.

---

## 9) Seed Data (Required)

Provide a script or startup option that seeds:
- 1 admin user
- 1 cashier user
- 3 categories
- 10 products
- inventory for each product

Document credentials in README (safe local only):
- admin: `admin@local.dev` / `admin1234`
- cashier: `cashier@local.dev` / `cashier1234`

---

## 10) Tests (Minimum)

Backend:
- Unit tests for order creation service:
  - calculates totals correctly
  - decrements inventory
  - fails if stock insufficient
- At least 1 API test for login + create order flow (can be minimal)

Frontend:
- Optional, but at least keep TypeScript types strict and avoid runtime errors.

---

## 11) Step-by-step Execution Plan (Do in order)

1. Scaffold repo structure + docs stubs.
2. Implement docker compose (postgres + backend + frontend) and confirm it boots.
3. Backend:
   - models + alembic migrations
   - auth + RBAC
   - CRUD categories/products
   - inventory endpoints
   - order creation transactional service
   - reports endpoint
   - seed script
   - tests
4. Frontend:
   - login page
   - dashboard navigation by role
   - products list + search
   - order/cart creation screen
   - admin pages for products/categories/inventory
   - daily report page (admin)
5. Polish README + docs with diagrams and run instructions.

---

## 12) Output Expectations

When you implement changes:
- keep diffs minimal & coherent
- update README/docs when adding features
- don’t leave “TODO” in production paths
- ensure `docker compose up --build` works without manual fixes

If something must be skipped, clearly document it in `docs/architecture.md` as a trade-off.

End.