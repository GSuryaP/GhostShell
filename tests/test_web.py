"""Unit tests for GhostShell FastAPI web dashboard."""

from fastapi.testclient import TestClient
from ghostshell.web.app import app

client = TestClient(app)

def test_api_status():
    resp = client.get("/api/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "status" in data
    assert "version" in data
    assert "default_model" in data

def test_api_alert_safe_command():
    resp = client.post("/api/alert", json={"command": "ls -la /var/log"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_dangerous"] is False
    assert data["severity"] == "LOW"

def test_api_alert_dangerous_command():
    resp = client.post("/api/alert", json={"command": "rm -rf / --no-preserve-root"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_dangerous"] is True
    assert data["severity"] == "CRITICAL"
    assert len(data["hazards"]) > 0
    assert data["safe_alternative"] is not None

def test_api_history():
    resp = client.get("/api/history?limit=5")
    assert resp.status_code == 200
    data = resp.json()
    assert "history" in data
    assert isinstance(data["history"], list)

def test_serve_static_index():
    resp = client.get("/")
    assert resp.status_code == 200
    assert "text/html" in resp.headers["content-type"]
    assert "GhostShell" in resp.text
