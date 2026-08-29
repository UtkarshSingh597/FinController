"""End-to-End System Integration and Verification Runner for FINCONTROL."""

import sys
import urllib.request

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db_session
from app.main import create_app


def run_full_verification():
    print("=" * 80)
    print("FINCONTROL - COMPREHENSIVE END-TO-END INTEGRATION TEST SUITE")
    print("=" * 80)

    # 1. Setup in-memory verification database & FastAPI TestClient
    print("\n[STEP 1] Initializing Isolated Verification Database & FastAPI Engine...")
    test_engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(test_engine)
    testing_session = sessionmaker(
        bind=test_engine, autoflush=False, autocommit=False, expire_on_commit=False
    )

    def override_get_db():
        with testing_session() as session:
            try:
                yield session
                session.commit()
            except Exception:
                session.rollback()
                raise

    app = create_app()
    app.dependency_overrides[get_db_session] = override_get_db
    client = TestClient(app)
    print("[PASS] FastAPI application and test database initialized.")

    # 2. Health check
    print("\n[STEP 2] Verifying System Health API...")
    health_res = client.get("/api/v1/health")
    assert health_res.status_code == 200, f"Health check failed: {health_res.text}"
    health_data = health_res.json()
    version_str = health_data.get("version", "1.0")
    print(f"[PASS] Health API Status: {health_data['status']} (v{version_str})")

    # 3. Tenant Registration & Authentication
    print("\n[STEP 3] Registering Enterprise Tenant Alpha...")
    reg_payload = {
        "organization_name": "Apex Global Finance",
        "email": "lead.analyst@apex-global.com",
        "display_name": "Morgan Vance",
        "password": "Production-grade-password-2026!",
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    token_alpha = reg_res.json()["access_token"]
    headers_alpha = {"Authorization": f"Bearer {token_alpha}"}
    token_len = len(token_alpha)
    print(f"[PASS] Tenant Alpha Registered. JWT Bearer token issued (length: {token_len} chars).")

    # 4. Verify Identity via /auth/me
    print("\n[STEP 4] Verifying Authenticated Principal Session (/auth/me)...")
    me_res = client.get("/api/v1/auth/me", headers=headers_alpha)
    assert me_res.status_code == 200, f"/auth/me failed: {me_res.text}"
    me_data = me_res.json()
    org_id_alpha = me_data["organization_id"]
    u_name = me_data["display_name"]
    o_name = me_data["organization_name"]
    r_name = me_data["role"]
    print(f"[PASS] Principal Authenticated: User='{u_name}', Org='{o_name}', Role='{r_name}'")
    print(f"       Tenant Organization ID: {org_id_alpha}")

    # 5. Seed Synthetic Financial Data
    print("\n[STEP 5] Seeding Synthetic Financial Telemetry (30 days of transactions)...")
    seed_res = client.post("/api/v1/analytics/seed-demo", headers=headers_alpha)
    assert seed_res.status_code == 200, f"Seed demo failed: {seed_res.text}"
    seed_msg = seed_res.json()["message"]
    print(f"[PASS] Synthetic Seed Result: {seed_msg}")

    # 6. Analytics & Financial Summary
    print("\n[STEP 6] Querying Tenant Financial Summary (/analytics/summary)...")
    summary_res = client.get("/api/v1/analytics/summary?days=30", headers=headers_alpha)
    assert summary_res.status_code == 200, f"Analytics summary failed: {summary_res.text}"
    summary = summary_res.json()
    rev_val = float(summary["revenue"])
    orders_val = summary["order_count"]
    aov_val = float(summary["average_order_value"])
    sr_val = float(summary["payment_success_rate"]) * 100
    ref_val = float(summary["refund_amount"])
    settle_val = float(summary["pending_settlement"])
    exp_val = float(summary["expenses"])
    net_val = float(summary["net_cash_flow"])

    print("[PASS] Financial Baseline Retrieved:")
    print(f"       - Gross Revenue:       ${rev_val:,.2f}")
    print(f"       - Order Count:         {orders_val}")
    print(f"       - Average Order Value: ${aov_val:,.2f}")
    print(f"       - Success Rate:        {sr_val:.1f}%")
    print(f"       - Refund Volume:       ${ref_val:,.2f}")
    print(f"       - Pending Settlement:  ${settle_val:,.2f}")
    print(f"       - Operating Expenses:  ${exp_val:,.2f}")
    print(f"       - Net Cash Flow:       ${net_val:,.2f}")

    # 7. Payment Decline Breakdown
    print("\n[STEP 7] Querying Payment Health & Decline Attribution (/analytics/payments)...")
    payments_res = client.get("/api/v1/analytics/payments", headers=headers_alpha)
    assert payments_res.status_code == 200
    p_data = payments_res.json()
    tot_p = p_data["total_payments"]
    succ_p = p_data["succeeded"]
    fail_p = p_data["failed"]
    reasons = p_data["failure_reasons"]
    print(f"[PASS] Total Payments: {tot_p} | Succeeded: {succ_p} | Failed: {fail_p}")
    print(f"       Decline Reasons: {reasons}")

    # 8. Settlement Reconciliation
    print("\n[STEP 8] Querying Settlement Batches (/analytics/settlements)...")
    settle_res = client.get("/api/v1/analytics/settlements", headers=headers_alpha)
    assert settle_res.status_code == 200
    settle_list = settle_res.json()
    print(f"[PASS] Retrieved {len(settle_list)} settlement batches:")
    for s in settle_list:
        s_id = s["id"]
        s_prov = s["provider"]
        s_exp = s["expected_amount"]
        s_stat = s["status"]
        print(f"       - Batch {s_id}: Provider={s_prov}, Expected=${s_exp:,.2f}, Status={s_stat}")

    # 9. Isolation Forest ML Anomaly Detection
    print("\n[STEP 9] Querying Isolation Forest Outlier Ledger (/anomalies)...")
    anom_res = client.get("/api/v1/anomalies", headers=headers_alpha)
    assert anom_res.status_code == 200
    anomalies = anom_res.json()
    print(f"[PASS] Retrieved {len(anomalies)} ML anomaly records:")
    for a in anomalies[:3]:
        a_sev = a["severity"].upper()
        a_score = a["anomaly_score"]
        a_type = a["entity_type"]
        a_id = a["entity_id"]
        a_feat = a["explanation_features"]
        print(f"       - Outlier [{a_sev}]: Score={a_score}, Entity={a_type} {a_id}")
        print(f"         Features: {a_feat}")

    # 10. Autonomous AI Analyst Multi-Skill Investigation
    print("\n[STEP 10] Triggering Autonomous AI Investigation (/investigations)...")
    question = "Why did revenue decline over the trailing 72 hours on card payments?"
    inv_payload = {"question": question}
    inv_res = client.post("/api/v1/investigations", json=inv_payload, headers=headers_alpha)
    assert inv_res.status_code in (200, 201), f"Investigation failed: {inv_res.text}"
    inv_data = inv_res.json()
    inv_id = inv_data["id"]
    conclusion = inv_data["conclusion"]
    primary_sk = conclusion.get("primary_skill")
    skills_used = ", ".join(conclusion.get("skills", []))
    conf_level = conclusion.get("confidence", "").upper()
    ev_count = conclusion.get("evidence_count")
    finding_txt = conclusion.get("text")
    rec_action = conclusion.get("recommended_action")

    print(f"[PASS] Investigation Completed: ID={inv_id}")
    print(f"       - Primary Skill:       {primary_sk}")
    print(f"       - Skills Orchestrated: {skills_used}")
    print(f"       - Confidence Level:    {conf_level}")
    print(f"       - Evidence Signals:    {ev_count} collected items")
    print(f"       - Synthesized Finding: {finding_txt}")
    print(f"       - Recommended Action:  {rec_action}")

    # Verify Evidence Graph
    graph = conclusion.get("evidence_graph")
    assert graph is not None, "Evidence graph missing from conclusion!"
    node_labels = [n["label"] for n in graph["nodes"]]
    link_descriptions = [
        f"{lnk['source']} -> {lnk['target']} ({lnk['relation']})" for lnk in graph["links"]
    ]
    print("[PASS] Structured Evidence Graph Generated:")
    print(f"       - Nodes ({len(graph['nodes'])}): {node_labels}")
    print(f"       - Causal Links ({len(graph['links'])}): {link_descriptions}")

    # 11. Investigation History Registry
    print("\n[STEP 11] Inspecting Investigation History Registry (/investigations)...")
    inv_list_res = client.get("/api/v1/investigations", headers=headers_alpha)
    assert inv_list_res.status_code == 200
    inv_list = inv_list_res.json()
    assert any(item["id"] == inv_id for item in inv_list)
    print(f"[PASS] Verified investigation {inv_id} exists in registry (total: {len(inv_list)}).")

    # 12. Deterministic Revenue Scenario Simulation
    print("\n[STEP 12] Running Multi-Variable Scenario Simulation (/simulations/revenue)...")
    sim_payload = {
        "percent_change": -15.0,
        "payment_failure_change": 10.0,
        "refund_change": 20.0,
        "delay_days": 2,
    }
    sim_res = client.post(
        "/api/v1/simulations/revenue", json=sim_payload, headers=headers_alpha
    )
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    sim_cls = sim_data.get("classification", "SIMULATION")
    sim_base = float(sim_data["baseline_revenue"])
    sim_proj = float(sim_data["projected_revenue"])
    sim_imp = float(sim_data["impact"])
    sim_ass = sim_data["assumption"]

    print("[PASS] Simulation Results (Deterministic Math):")
    print(f"       - Classification:    {sim_cls}")
    print(f"       - Baseline Revenue:  ${sim_base:,.2f}")
    print(f"       - Projected Revenue: ${sim_proj:,.2f}")
    print(f"       - Net Impact Delta:  ${sim_imp:,.2f}")
    print(f"       - Assumptions:       {sim_ass}")

    # 13. Strict Cross-Tenant Security Isolation
    print("\n[STEP 13] Verifying Multi-Tenant Security Isolation (Tenant Beta)...")
    reg_beta = client.post(
        "/api/v1/auth/register",
        json={
            "organization_name": "Beta Capital LLC",
            "email": "compliance@beta-capital.com",
            "display_name": "Taylor Reed",
            "password": "Production-grade-password-2026!",
        },
    )
    token_beta = reg_beta.json()["access_token"]
    headers_beta = {"Authorization": f"Bearer {token_beta}"}

    summary_beta = client.get("/api/v1/analytics/summary", headers=headers_beta).json()
    rev_beta = float(summary_beta["revenue"])
    assert rev_beta == 0, "Tenant Beta leaked Tenant Alpha data!"
    print(f"[PASS] Tenant Beta isolated summary: Revenue = ${rev_beta:.2f} (Zero data leakage)")

    forbidden_inv = client.get(f"/api/v1/investigations/{inv_id}", headers=headers_beta)
    assert forbidden_inv.status_code == 404, "Tenant Beta accessed Tenant Alpha investigation!"
    print(f"[PASS] Tenant Beta access to Tenant Alpha Investigation {inv_id} returned 404.")

    # 14. Frontend Next.js Route Verification
    print("\n[STEP 14] Verifying Next.js Frontend Server on http://localhost:3000...")
    frontend_routes = [
        "/",
        "/ai-analyst",
        "/investigations",
        "/anomalies",
        "/revenue",
        "/payments",
        "/settlements",
        "/cash-flow",
        "/scenarios",
        "/alerts",
        "/settings",
        "/auth",
    ]
    for r in frontend_routes:
        try:
            req = urllib.request.urlopen(f"http://localhost:3000{r}", timeout=5)
            content = req.read().decode("utf-8")
            content_len = len(content)
            print(f"[PASS] Route {r:18} -> 200 OK ({content_len:,} bytes rendered)")
        except Exception as e:
            print(f"[FAIL] Route {r:18} -> Error: {e}")
            sys.exit(1)

    print("\n" + "=" * 80)
    print("ALL 14 END-TO-END VERIFICATION PHASES PASSED 100% WITH ZERO ERRORS!")
    print("=" * 80)


if __name__ == "__main__":
    run_full_verification()
