import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from app.api import api_router
from app.core import deps
from app.core.security import hash_password
from app.db.base import Base
from app.models import Category, Inventory, Product, User, Order, OrderItem  # ensure tables are registered
from app.main import app as fastapi_app


@pytest.fixture(scope="session")
def engine():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(bind=engine)
    yield engine
    engine.dispose()


@pytest.fixture
def db_session(engine):
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    session = TestingSessionLocal()
    try:
        # ensure schema exists (in case metadata changed)
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        # clean tables
        for tbl in reversed(Base.metadata.sorted_tables):
            session.execute(tbl.delete())
        session.commit()
        yield session
    finally:
        session.close()


@pytest.fixture
def seed_data(db_session):
    admin = User(
        email="admin@test.dev",
        role="admin",
        password_hash=hash_password("adminpass"),
        is_active=True,
    )
    cashier = User(
        email="cashier@test.dev",
        role="cashier",
        password_hash=hash_password("cashierpass"),
        is_active=True,
    )
    db_session.add_all([admin, cashier])
    db_session.flush()

    cat = Category(name="Snacks", is_active=True)
    db_session.add(cat)
    db_session.flush()

    product = Product(sku="SNK-001", name="Chips", category_id=cat.id, price=1.99, is_active=True)
    db_session.add(product)
    db_session.flush()

    inventory = Inventory(product_id=product.id, quantity=10)
    db_session.add(inventory)

    db_session.commit()
    return {"admin": admin, "cashier": cashier, "product": product, "inventory": inventory}


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    fastapi_app.dependency_overrides[deps.get_db_session] = override_get_db
    # routers already included in app
    with TestClient(fastapi_app) as c:
        yield c
    fastapi_app.dependency_overrides = {}
