from fastapi.testclient import TestClient


def register_user(client: TestClient, email: str) -> str:
    res = client.post(
        "/api/v1/auth/register",
        json={
            "organization_name": "Acme Followup Org",
            "email": email,
            "display_name": "Investigator",
            "password": "strong-password-123",
        },
    )
    assert res.status_code == 201
    return res.json()["access_token"]


def test_investigation_followup_and_export(client: TestClient):
    token = register_user(client, "followup_tester@example.com")
    auth_headers = {"Authorization": f"Bearer {token}"}

    # 1. Create initial investigation
    create_resp = client.post(
        "/api/v1/investigations",
        json={"question": "Why did gross revenue decline this month?"},
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    inv_data = create_resp.json()
    inv_id = inv_data["id"]
    assert inv_data["status"] == "completed"
    assert len(inv_data["conclusion"]["evidence_graph"]["nodes"]) >= 3

    # 2. Submit multi-turn follow-up question
    followup_q = "Can you check if gateway failures contributed to this?"
    followup_resp = client.post(
        f"/api/v1/investigations/{inv_id}/follow-up",
        json={"followup_question": followup_q},
        headers=auth_headers,
    )
    assert followup_resp.status_code == 200
    f_data = followup_resp.json()
    assert len(f_data["conclusion"]["follow_ups"]) == 1
    assert f_data["conclusion"]["follow_ups"][0]["question"] == followup_q
    graph_nodes = f_data["conclusion"]["evidence_graph"]["nodes"]
    assert any(n["category"] == "interrogation" for n in graph_nodes)

    # 3. Export as JSON
    json_export = client.get(
        f"/api/v1/investigations/{inv_id}/export?format=json", headers=auth_headers
    )
    assert json_export.status_code == 200
    assert "investigation_id" in json_export.json()

    # 4. Export as CSV
    csv_export = client.get(
        f"/api/v1/investigations/{inv_id}/export?format=csv", headers=auth_headers
    )
    assert csv_export.status_code == 200
    assert "Evidence Type,Source,Description,Data Payload" in csv_export.text

    # 5. Export as Markdown
    md_export = client.get(
        f"/api/v1/investigations/{inv_id}/export?format=markdown", headers=auth_headers
    )
    assert md_export.status_code == 200
    assert "# FINController Audit Report" in md_export.text
    assert "## 4. Multi-Turn Interrogation History" in md_export.text
