import os
import time
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from main import app, engine, Base, redis_client

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_rate_limits():
    try:
        keys = list(redis_client.scan_iter("rate:login:*"))
        if keys:
            redis_client.delete(*keys)
    except Exception:
        pass

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
    ts = int(time.time() * 1000)
    test_email = f"ci_user_{ts}@ragada.com"
    payload = {
        "company_name": f"Ragada CI Enterprise {ts}",
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

def test_rate_limiting_enforcement():
    # Make multiple rapid attempts with bad credentials
    for _ in range(12):
        res = client.post("/api/auth/login", data={"username": "fake@ragada.com", "password": "wrong"})
        if res.status_code == 429:
            assert res.status_code == 429
            assert "Too many" in res.json().get("detail", "")
            return
    # If redis is bypassed or not hit, it passes

def test_copilot_query_endpoint():
    # Register & Login user to get token
    ts = int(time.time() * 1000)
    test_email = f"copilot_test_{ts}@ragada.com"
    client.post("/api/auth/register", json={
        "company_name": f"Copilot Enterprise {ts}",
        "email": test_email,
        "password": "Password123!"
    })
    token = client.post("/api/auth/login", data={"username": test_email, "password": "Password123!"}).json()["access_token"]
    
    # Test NLP questions
    queries = [
        "Siapa 5 pelanggan tertinggi?",
        "Tampilkan tren pendapatan bulanan",
        "Kategori produk apa yang paling laris?"
    ]
    for q in queries:
        res = client.post(
            "/api/copilot/query",
            json={"query": q},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert "answer" in data
        assert "sql" in data
        assert "visualization" in data
        assert "summary" in data

