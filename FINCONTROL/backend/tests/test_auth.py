from fastapi.testclient import TestClient


def register(client: TestClient, *, email: str, organization_name: str = "Northstar Labs") -> str:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "organization_name": organization_name,
            "email": email,
            "display_name": "Avery Analyst",
            "password": "a-long-test-password",
        },
    )
    assert response.status_code == 201
    return response.json()["access_token"]


def test_registration_login_and_current_user(client: TestClient) -> None:
    token = register(client, email="avery@example.com")
    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert me.status_code == 200
    assert me.json()["email"] == "avery@example.com"
    assert me.json()["role"] == "owner"

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "avery@example.com", "password": "a-long-test-password"},
    )
    assert login.status_code == 200
    assert login.json()["token_type"] == "bearer"


def test_protected_route_rejects_missing_or_invalid_token(client: TestClient) -> None:
    assert client.get("/api/v1/auth/me").status_code == 401
    assert (
        client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid"}).status_code
        == 401
    )


def test_duplicate_email_and_invalid_login_fail_safely(client: TestClient) -> None:
    register(client, email="duplicate@example.com")

    duplicate = client.post(
        "/api/v1/auth/register",
        json={
            "organization_name": "Another Org",
            "email": "duplicate@example.com",
            "display_name": "Another Analyst",
            "password": "a-long-test-password",
        },
    )
    invalid_login = client.post(
        "/api/v1/auth/login",
        json={"email": "duplicate@example.com", "password": "wrong-password"},
    )

    assert duplicate.status_code == 409
    assert invalid_login.status_code == 401
