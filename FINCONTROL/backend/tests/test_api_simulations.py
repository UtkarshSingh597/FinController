from fastapi.testclient import TestClient


def register_user(client: TestClient, email: str) -> str:
    res = client.post(
        "/api/v1/auth/register",
        json={
            "organization_name": "Scenario FinTech",
            "email": email,
            "display_name": "Scenario Tester",
            "password": "strong-password-123",
        },
    )
    assert res.status_code == 201
    return res.json()["access_token"]


def test_revenue_simulation_api(client: TestClient) -> None:
    token = register_user(client, "scenario@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post(
        "/api/v1/simulations/revenue",
        json={
            "percent_change": "-15",
            "payment_failure_change": "10",
            "refund_change": "20",
            "delay_days": 2,
        },
        headers=headers,
    )
    assert res.status_code == 200
    data = res.json()
    assert data["classification"] == "SIMULATION"
    assert "projected_revenue" in data
    assert "impact" in data
    assert "assumption" in data
