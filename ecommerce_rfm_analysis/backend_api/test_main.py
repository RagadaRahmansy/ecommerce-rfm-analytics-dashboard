import os
import pytest
from fastapi.testclient import TestClient

# Override the database URL to use an in-memory SQLite database for testing BEFORE importing the app
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from main import app, startup_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def run_startup():
    # Manually trigger the startup event to ingest data into the test SQLite DB
    startup_db()

def test_overview_endpoint():
    response = client.get("/api/overview")
    assert response.status_code == 200
    data = response.json()
    assert "kpi" in data
    assert "total_sales" in data["kpi"]
    assert data["kpi"]["total_transactions"] > 0

def test_churn_endpoint():
    response = client.get("/api/churn")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "top_at_risk" in data
    
def test_clustering_endpoint():
    response = client.get("/api/clustering?k=3")
    assert response.status_code == 200
    data = response.json()
    assert "profile" in data
    assert len(data["profile"]) == 3
