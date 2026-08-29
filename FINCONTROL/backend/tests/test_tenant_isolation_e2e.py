from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.mcp.contracts import ToolContext, get_financial_summary


def register_tenant(client: TestClient, *, email: str, org_name: str) -> tuple[str, str]:
    res = client.post(
        "/api/v1/auth/register",
        json={
            "organization_name": org_name,
            "email": email,
            "display_name": f"{org_name} Admin",
            "password": "strong-password-123",
        },
    )
    assert res.status_code == 201
    token = res.json()["access_token"]

    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    org_id = me_res.json()["organization_id"]
    return token, org_id


def test_cross_tenant_isolation_e2e(client: TestClient) -> None:
    # 1. Register Tenant A & Tenant B
    token_a, org_id_a = register_tenant(
        client, email="alice@tenant-alpha.com", org_name="Tenant Alpha"
    )
    token_b, org_id_b = register_tenant(
        client, email="bob@tenant-beta.com", org_name="Tenant Beta"
    )
    assert org_id_a != org_id_b

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 2. Seed Demo Data for Tenant A only
    seed_res_a = client.post("/api/v1/analytics/seed-demo", headers=headers_a)
    assert seed_res_a.status_code == 200

    # 3. Tenant A Summary has real positive revenue
    summary_a = client.get("/api/v1/analytics/summary", headers=headers_a).json()
    assert float(summary_a["revenue"]) > 0

    # 4. Tenant B Summary has 0 revenue (isolated!)
    summary_b = client.get("/api/v1/analytics/summary", headers=headers_b).json()
    assert float(summary_b["revenue"]) == 0

    # 5. Tenant A creates an investigation
    inv_a = client.post(
        "/api/v1/investigations",
        json={"question": "Why did revenue fall on card payments?"},
        headers=headers_a,
    ).json()
    inv_id_a = inv_a["id"]
    assert "evidence_graph" in inv_a["conclusion"]

    # 6. Tenant B tries to access Tenant A's investigation -> MUST BE 404 NOT FOUND
    forbidden_get = client.get(f"/api/v1/investigations/{inv_id_a}", headers=headers_b)
    assert forbidden_get.status_code == 404

    # 7. Tenant B list investigations -> does not see Tenant A's investigation
    list_b = client.get("/api/v1/investigations", headers=headers_b).json()
    assert not any(item["id"] == inv_id_a for item in list_b)

    # 8. MCP Tool Level Isolation: Calling MCP contract with empty context
    override = next(iter(client.app.dependency_overrides.values()))
    generator = override()
    session: Session = next(generator)

    random_ctx = ToolContext(organization_id=uuid4(), user_id=uuid4())
    mcp_res = get_financial_summary(
        session,
        context=random_ctx,
        period_start=summary_a["period_start"],
        period_end=summary_a["period_end"],
    )
    assert mcp_res.revenue == 0
    generator.close()
