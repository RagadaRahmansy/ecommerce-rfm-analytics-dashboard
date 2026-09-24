import os
import time
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from main import app, engine, Base

client = TestClient(app)

@pytest.fixture(autouse=True, scope="session")
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS transactions (
                "InvoiceNo" TEXT,
                "InvoiceDate" TIMESTAMP,
                "CustomerID" TEXT,
                "Category" TEXT,
                "Quantity" FLOAT,
                "UnitPrice" FLOAT,
                "TotalPrice" FLOAT,
                "Country" TEXT,
                tenant_id INTEGER
            );
        """))

def test_liveness_probe():
    response = client.get("/api/health/live")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"
    assert "service" in data

def test_readiness_probe():
    response = client.get("/api/health/ready")
    assert response.status_code in [200, 503]
    data = response.json()
    assert "status" in data
    assert "checks" in data
    assert "database" in data["checks"]

def test_auth_and_status_flow():
    test_email = f"ci_user_{int(time.time())}@ragada.com"
    payload = {
        "company_name": "Ragada CI Enterprise",
        "email": test_email,
        "password": "Password123!"
    }
    # Register
    reg_res = client.post("/api/auth/register", json=payload)
    assert reg_res.status_code == 200

    # Login
    login_res = client.post("/api/auth/login", data={"username": test_email, "password": "Password123!"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token is not None

    # Check /api/status with token
    status_res = client.get("/api/status", headers={"Authorization": f"Bearer {token}"})
    assert status_res.status_code == 200
    res_data = status_res.json()
    assert "has_data" in res_data
    assert res_data["user"]["email"] == test_email
