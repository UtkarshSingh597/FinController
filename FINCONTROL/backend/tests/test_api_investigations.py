from fastapi.testclient import TestClient


def register_user(client: TestClient, email: str) -> str:
    res = client.post(
        "/api/v1/auth/register",
        json={
            "organization_name": "Acme FinTech",
            "email": email,
            "display_name": "Test User",
            "password": "strong-password-123",
        },
    )
    assert res.status_code == 201
    return res.json()["access_token"]


def test_create_and_list_investigations_api(client: TestClient) -> None:
    token = register_user(client, "investigator@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post(
        "/api/v1/investigations",
        json={"question": "Why did revenue fall yesterday?"},
        headers=headers,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["question"] == "Why did revenue fall yesterday?"
    assert data["status"] == "completed"
    assert len(data["evidence"]) >= 1
    assert data["conclusion"]["type"] == "hypothesis"

    investigation_id = data["id"]

    # Test get investigation by ID
    get_res = client.get(f"/api/v1/investigations/{investigation_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == investigation_id

    # Test list investigations
    list_res = client.get("/api/v1/investigations", headers=headers)
    assert list_res.status_code == 200
    assert any(item["id"] == investigation_id for item in list_res.json())
