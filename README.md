# Codex POS Monorepo

Scaffolding for a portfolio-grade POS system with Next.js frontend, FastAPI backend, PostgreSQL, and Docker Compose orchestration. Follow `AGENT.md` for execution order; current stage sets up repo structure and dev containers.

## Structure
- `frontend/` Next.js app router client
- `backend/` FastAPI service with Alembic, RBAC, and tests
- `infra/` infrastructure and deployment assets
- `docs/` architecture notes, API contract, ERD
- `docker-compose.yml` local orchestration (postgres + backend + frontend)
- `.env.example` shared environment defaults

## Quick start
1) Prereqs: Docker + Docker Compose, Node 18+, Python 3.11+, Git.
2) Clone and `cp .env.example .env`
3) Backend deps (optional for local runs/tests): `cd backend && python -m pip install -r requirements.txt`
4) Frontend deps (optional for local runs): `cd frontend && npm install`
5) Run stack: `docker compose up --build`
6) Health checks: backend http://localhost:8000/api/health; frontend http://localhost:3000

Seed data: after running migrations, execute `python -m app.utils.seed` inside the backend container to create default users/products (admin: `admin@local.dev` / `admin1234`, cashier: `cashier@local.dev` / `cashier1234`).

## Next Steps
Implement backend models/auth/CRUD/tests, then frontend flows and docs updates.
Frontend currently includes auth, protected navigation shell, products/categories CRUD UIs, inventory adjustments (admin), order creation (cashier/admin), and daily report view (admin).

## Development notes
- Migrations: `cd backend && alembic upgrade head` (DATABASE_URL from .env)
- Backend dev: `uvicorn app.main:app --reload --port 8000`
- Frontend dev: `npm run dev` from `frontend/`
- Tests: from `backend/`, install deps then `pytest`

## Running with Docker (tested)
1) Ensure Docker Desktop is running.
2) From repo root: `docker compose up -d db backend`
   - Backend image includes Alembic; migrations applied with:
     `docker compose exec backend sh -c "PYTHONPATH=/app alembic upgrade head"`
   - Seed data: `docker compose exec backend python -m app.utils.seed`
3) Frontend dev server (local host machine): `cd frontend && npm install && NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 npm run dev -- --hostname=0.0.0.0 --port=3000`
4) Login with `admin@local.dev / admin1234` or `cashier@local.dev / cashier1234`.
5) If ports are busy, stop existing node processes and re-run dev command.

## Tech stack
- Frontend: Next.js (App Router) + TypeScript + TailwindCSS; fetch-based API calls.
- Backend: FastAPI + SQLAlchemy 2.0 + Alembic + Pydantic v2; JWT auth with role-based access; pytest + httpx for tests.
- Database: PostgreSQL (via Docker Compose).
- Tooling: Docker/Docker Compose for orchestration.

## Environment & data (dev vs prod)
- Environment variables live in `.env` (copy from `.env.example`). For production, set secure values for `JWT_SECRET`, database credentials, and API base URLs.
- Backend uses `DATABASE_URL` (e.g., `postgresql+psycopg2://user:pass@db:5432/codex_pos`). Change per environment in `.env` or deployment secrets.
- Frontend uses `NEXT_PUBLIC_API_BASE_URL` to point at the backend for each environment.
- Seed data script: `python -m app.utils.seed` (inside backend container or venv) to load default admin/cashier users and sample catalog; skip or replace for production.
- Accounts (dev):
  - Admin: `admin@local.dev` / `admin1234`
  - Cashier: `cashier@local.dev` / `cashier1234`

## Local start/stop (PowerShell)
- Start all services: `powershell -ExecutionPolicy Bypass -File scripts\start.ps1`
- Stop: `powershell -ExecutionPolicy Bypass -File scripts\stop.ps1`

These run `docker compose up -d db backend frontend` and `docker compose down`. Ensure Docker Desktop is running and `.env` is present.
