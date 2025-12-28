# Backend (FastAPI)

FastAPI backend scaffold for the Codex POS system. Planned features include JWT auth with RBAC, Alembic migrations, transactional order handling, and structured logging.

## Layout (scaffold)
- `app/` application code (core, db, models, schemas, services, api, utils)
- `alembic/` migrations
- `tests/` unit and API tests

## Run (dev scaffold)
- Local: `uvicorn app.main:app --reload --port 8000`
- Docker: built via `docker compose up --build` (service: `backend`)

Migrations: `alembic upgrade head` (env var `DATABASE_URL` honored). Seed dev data: `python -m app.utils.seed` after migrations (creates admin/cashier users and sample catalog).

Implementation and detailed instructions will be expanded as features land.
