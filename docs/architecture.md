# Architecture Overview

This document will outline the monorepo architecture, including frontend/backend boundaries, data flow, security posture, and deployment story. Sections will be expanded as services are implemented.

- **Frontend:** Next.js App Router client consuming the backend API; uses fetch wrapper with bearer token, protected shell for role-based navigation, and screens for login, CRUD, inventory, orders, and reports.
- **Backend:** FastAPI service with SQLAlchemy, Alembic migrations, JWT auth, and role-based routers for admin/cashier.
- **Database:** PostgreSQL with migrations and seed data.
- **Orchestration:** Docker Compose for local dev.

Detailed component diagrams and request flows will be added during implementation milestones.
