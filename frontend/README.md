# Frontend (Next.js App Router)

Next.js + TailwindCSS scaffold for the Codex POS interface. Planned flows include login, protected dashboards, CRUD for products/categories/inventory, order creation, and daily reports.

## Layout (scaffold)
- `app/` route segments for auth, dashboard, products, categories, orders, reports
- `lib/` shared API and auth helpers

## Features (MVP)
- Login page posting to backend `/api/auth/login`, stores bearer token locally.
- Protected shell with role-based nav (admin/cashier) and sign-out.
- Products list + search, admin-only create.
- Categories list/create/deactivate (admin).
- Inventory list/update (admin).
- Orders: add products to cart and submit order; view recent orders.
- Reports: daily report fetch by date (admin).

## Run
- Local: `npm install` then `npm run dev`
- Docker: `docker compose up --build` (service: `frontend`)
