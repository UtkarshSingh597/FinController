import io

from fastapi.testclient import TestClient


def register_user(client: TestClient, email: str) -> str:
    res = client.post(
        "/api/v1/auth/register",
        json={
            "organization_name": "Acme CSV Ingestion",
            "email": email,
            "display_name": "CSV User",
            "password": "strong-password-123",
        },
    )
    assert res.status_code == 201
    return res.json()["access_token"]


def test_json_batch_ingestion(client: TestClient):
    token = register_user(client, "csv_json@example.com")
    auth_headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "rows": [
            {
                "date": "2026-08-20T10:00:00Z",
                "amount": 150.00,
                "type": "order",
                "description": "SaaS Annual Plan",
                "currency": "USD",
            },
            {
                "date": "2026-08-20T11:00:00Z",
                "amount": 45.00,
                "type": "expense",
                "description": "Cloud hosting fee",
                "currency": "USD",
                "category": "infrastructure",
            },
            {
                "date": "2026-08-21T09:00:00Z",
                "amount": 200.00,
                "type": "settlement",
                "description": "Weekly bank payout",
                "currency": "EUR",
            },
        ]
    }
    resp = client.post("/api/v1/ingestion/json", json=payload, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["orders_created"] == 1
    assert data["expenses_created"] == 1
    assert data["settlements_created"] == 1


def test_csv_file_upload(client: TestClient):
    token = register_user(client, "csv_file@example.com")
    auth_headers = {"Authorization": f"Bearer {token}"}

    csv_content = (
        "date,amount,type,description,currency\n"
        "2026-08-22,350.00,order,Enterprise License,USD\n"
        "2026-08-23,120.00,expense,Software Subscription,USD\n"
    )
    files = {"file": ("statement.csv", io.BytesIO(csv_content.encode()), "text/csv")}
    resp = client.post("/api/v1/ingestion/csv-statement", files=files, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["orders_created"] == 1
    assert data["expenses_created"] == 1
