from fastapi.testclient import TestClient


def register_user(client: TestClient, email: str) -> str:
    res = client.post(
        "/api/v1/auth/register",
        json={
            "organization_name": "Anomaly FinTech",
            "email": email,
            "display_name": "Anomaly Tester",
            "password": "strong-password-123",
        },
    )
    assert res.status_code == 201
    return res.json()["access_token"]


def test_get_anomalies_api(client: TestClient) -> None:
    token = register_user(client, "anomaly@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # First call with no payments -> returns empty list
    res = client.get("/api/v1/anomalies", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

    # Seed demo data
    seed_res = client.post("/api/v1/analytics/seed-demo", headers=headers)
    assert seed_res.status_code == 200

    # Second call -> now evaluates anomalies
    res2 = client.get("/api/v1/anomalies", headers=headers)
    assert res2.status_code == 200
    assert isinstance(res2.json(), list)
