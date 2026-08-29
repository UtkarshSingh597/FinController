from fastapi.testclient import TestClient

from app.main import create_app


def test_health_endpoint_returns_request_context() -> None:
    response = TestClient(create_app()).get("/api/v1/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["request_id"] == response.headers["x-request-id"]
    assert response.headers["x-content-type-options"] == "nosniff"


def test_unknown_endpoint_does_not_leak_framework_details() -> None:
    response = TestClient(create_app()).get("/api/v1/not-a-route")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "http_error"
