from fastapi.testclient import TestClient


def register_user(client: TestClient, email: str) -> dict:
    res = client.post(
        "/api/v1/auth/register",
        json={
            "organization_name": "Acme Webhook Org",
            "email": email,
            "display_name": "Webhook User",
            "password": "strong-password-123",
        },
    )
    assert res.status_code == 201
    return res.json()


def test_stripe_webhook_payment_succeeded(client: TestClient):
    auth_data = register_user(client, "stripe_succ@example.com")
    token = auth_data["access_token"]
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    org_id = me_resp.json()["organization_id"]

    payload = {
        "id": "evt_test_123456",
        "type": "payment_intent.succeeded",
        "data": {
            "object": {
                "amount": 49900,
                "currency": "usd",
                "receipt_email": "jane@example.com",
                "payment_method_types": ["card"],
            }
        },
    }
    headers = {"X-Organization-ID": str(org_id)}
    resp = client.post("/api/v1/webhooks/stripe", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["received"] is True
    assert data["event_type"] == "payment_intent.succeeded"
    assert "Payment(" in data["entity_created"]


def test_stripe_webhook_payment_failed(client: TestClient):
    auth_data = register_user(client, "stripe_fail@example.com")
    token = auth_data["access_token"]
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    org_id = me_resp.json()["organization_id"]

    payload = {
        "id": "evt_test_fail_123",
        "type": "payment_intent.payment_failed",
        "data": {
            "object": {
                "amount": 12000,
                "currency": "usd",
                "last_payment_error": {"message": "provider_timeout"},
            }
        },
    }
    headers = {"X-Organization-ID": str(org_id)}
    resp = client.post("/api/v1/webhooks/stripe", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["received"] is True
    assert data["event_type"] == "payment_intent.payment_failed"


def test_adyen_webhook_settlement(client: TestClient):
    auth_data = register_user(client, "adyen_settle@example.com")
    token = auth_data["access_token"]
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    org_id = me_resp.json()["organization_id"]

    payload = {
        "pspReference": "adyen_settle_789",
        "eventCode": "PAYOUT",
        "amount": 5400.50,
    }
    headers = {"X-Organization-ID": str(org_id)}
    resp = client.post("/api/v1/webhooks/adyen", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["received"] is True
    assert "Settlement(" in data["entity_created"]
