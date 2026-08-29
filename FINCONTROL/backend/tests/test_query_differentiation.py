from fastapi.testclient import TestClient


def register_and_seed(client: TestClient) -> dict[str, str]:
    res = client.post(
        "/api/v1/auth/register",
        json={
            "organization_name": "Differentiation Test Corp",
            "email": "diff.test@example.com",
            "display_name": "Diff Analyst",
            "password": "strong-password-123",
        },
    )
    assert res.status_code == 201
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    client.post("/api/v1/analytics/seed-demo", headers=headers)
    return headers


def test_query_differentiation_across_domains(client: TestClient) -> None:
    headers = register_and_seed(client)

    test_queries = [
        ("Why did revenue fall?", "revenue_investigation"),
        ("Why are payment failures increasing?", "payment_analysis"),
        ("Why are settlements delayed?", "settlement_analysis"),
        ("Why did refunds increase?", "revenue_leakage"),
        ("Which payments look anomalous?", "anomaly_investigation"),
        ("What is causing cash flow deterioration?", "cashflow_analysis"),
        ("What happens if revenue decreases by 15%?", "scenario_simulation"),
    ]

    results = []

    for question, expected_primary in test_queries:
        res = client.post("/api/v1/investigations", json={"question": question}, headers=headers)
        assert res.status_code in (200, 201)
        data = res.json()
        conclusion = data["conclusion"]
        evidence = data["evidence"]
        graph = conclusion["evidence_graph"]

        act_skill = conclusion["primary_skill"]
        assert act_skill == expected_primary, (
            f"Query '{question}' expected '{expected_primary}' but got '{act_skill}'"
        )
        assert len(evidence) >= 1
        assert len(graph["nodes"]) >= 3

        results.append({
            "question": question,
            "primary_skill": act_skill,
            "title": conclusion.get("title", ""),
            "text": conclusion["text"],
            "graph_nodes": [n["label"] for n in graph["nodes"]],
            "evidence_sources": [e["source"] for e in evidence],
        })

    # Verify that all 7 investigations produced distinct primary skills
    skills_set = {r["primary_skill"] for r in results}
    assert len(skills_set) == 7, f"Expected 7 distinct skills, got: {skills_set}"

    # Verify that all 7 investigations produced distinct titles
    titles_set = {r["title"] for r in results}
    assert len(titles_set) == 7, f"Expected 7 distinct titles, got {len(titles_set)}: {titles_set}"

    # Verify that all 7 investigations produced distinct conclusion texts
    texts_set = {r["text"] for r in results}
    assert len(texts_set) == 7, f"Expected 7 distinct conclusion texts, got {len(texts_set)}"
