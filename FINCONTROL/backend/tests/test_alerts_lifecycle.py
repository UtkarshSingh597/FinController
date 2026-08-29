from uuid import uuid4

from fastapi.testclient import TestClient


def register_user(client: TestClient, email: str) -> str:
    res = client.post(
        "/api/v1/auth/register",
        json={
            "organization_name": "Acme FinTech Alerts",
            "email": email,
            "display_name": "Alert User",
            "password": "strong-password-123",
        },
    )
    assert res.status_code == 201
    return res.json()["access_token"]


def test_alerts_lifecycle(client: TestClient):
    token = register_user(client, "alerts_tester@example.com")
    auth_headers = {"Authorization": f"Bearer {token}"}

    # 1. Seed demo data to generate alerts
    seed_resp = client.post("/api/v1/analytics/seed-demo", headers=auth_headers)
    assert seed_resp.status_code == 200

    # 2. List alerts
    resp = client.get("/api/v1/alerts", headers=auth_headers)
    assert resp.status_code == 200
    alerts_list = resp.json()
    assert len(alerts_list) >= 1
    alert_id = alerts_list[0]["id"]

    # 3. Mark as read
    read_resp = client.patch(f"/api/v1/alerts/{alert_id}/read", headers=auth_headers)
    assert read_resp.status_code == 200
    assert read_resp.json()["status"] == "read"

    # 4. Resolve alert
    res_resp = client.post(f"/api/v1/alerts/{alert_id}/resolve", headers=auth_headers)
    assert res_resp.status_code == 200
    assert res_resp.json()["status"] == "resolved"

    # 5. Non-existent alert returns 404
    fake_id = uuid4()
    not_found = client.patch(f"/api/v1/alerts/{fake_id}/read", headers=auth_headers)
    assert not_found.status_code == 404
