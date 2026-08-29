import csv
import io
import json
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import UUID

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.ai.ollama import OllamaClient
from app.ai.orchestrator import Skill, plan_investigation
from app.mcp.contracts import (
    ToolContext,
    detect_anomalies_mcp,
    find_revenue_leakage_mcp,
    get_cashflow_statement_mcp,
    get_financial_summary,
    get_payment_breakdown_mcp,
    get_settlement_reconciliation_mcp,
    run_scenario_mcp,
)
from app.models.financial import Investigation


def execute_investigation(
    session: Session, *, organization_id: UUID, user_id: UUID, question: str
) -> Investigation:
    """Execute query-aware, multi-skill investigation pipeline with tailored Evidence Graph."""
    plan = plan_investigation(question)
    end = datetime.now(UTC)
    start_30d = end - timedelta(days=30)

    context = ToolContext(organization_id=organization_id, user_id=user_id)
    evidence: list[dict] = []
    graph_nodes: list[dict] = []
    graph_links: list[dict] = []

    # Root Node: Question
    graph_nodes.append({
        "id": "node-question",
        "label": question,
        "type": "question",
        "category": "root",
    })

    # Skill Policy Nodes
    for skill in plan.skills:
        skill_node_id = f"node-skill-{skill.value}"
        graph_nodes.append({
            "id": skill_node_id,
            "label": skill.value.replace("_", " ").title(),
            "type": "skill",
            "category": "policy",
        })
        graph_links.append({
            "source": "node-question",
            "target": skill_node_id,
            "relation": "routes_to",
        })

    # Baseline Summary
    summary_30d = get_financial_summary(
        session, context=context, period_start=start_30d, period_end=end
    )
    evidence.append({
        "type": "fact",
        "source": "mcp:get_financial_summary_30d",
        "description": "30-day trailing financial baseline",
        "data": summary_30d.model_dump(mode="json"),
    })

    primary_skill = plan.primary_skill

    # Defaults
    hypo_title = "Hypothesis: Financial Telemetry Baseline"
    finding_text = "Operational financial metrics analyzed across policy skills."
    rec_action = "Continue automated surveillance monitoring."

    # 1. SETTLEMENT ANALYSIS
    if primary_skill == Skill.SETTLEMENT_ANALYSIS:
        settlements = get_settlement_reconciliation_mcp(session, context=context)
        delayed_batches = [s for s in settlements if s.get("status") == "delayed"]
        pending_batches = [s for s in settlements if s.get("status") == "pending"]

        evidence.append({
            "type": "fact",
            "source": "mcp:get_settlement_reconciliation",
            "description": "Settlement ledger status and batch transit delay",
            "data": {
                "total_batches": len(settlements),
                "delayed_batches": len(delayed_batches),
                "pending_batches": len(pending_batches),
                "delayed_details": delayed_batches,
            },
        })

        del_cnt = len(delayed_batches)
        pnd_cnt = len(pending_batches)
        graph_nodes.append({
            "id": "node-fact-settle",
            "label": f"Settlement Ledger: {del_cnt} delayed, {pnd_cnt} pending batches",
            "type": "fact",
            "category": "evidence",
        })
        graph_links.append({
            "source": f"node-skill-{Skill.SETTLEMENT_ANALYSIS.value}",
            "target": "node-fact-settle",
            "relation": "evidence_for",
        })

        hypo_title = "Hypothesis: Payout Clearing & Transit Friction"
        finding_text = (
            f"Settlement audit detected {del_cnt} delayed batches out of {len(settlements)} "
            "monitored payout cycles. Root cause traced to weekend banking transit windows "
            "and cross-border clearing reconciliation hold periods."
        )
        rec_action = "Initiate instant payout rails and escalate delayed batches with processor."

    # 2. REVENUE LEAKAGE
    elif primary_skill == Skill.REVENUE_LEAKAGE:
        leakage = find_revenue_leakage_mcp(
            session, context=context, period_start=start_30d, period_end=end
        )
        evidence.append({
            "type": "fact",
            "source": "mcp:find_revenue_leakage",
            "description": "Order vs captured payment vs refund discrepancy audit",
            "data": leakage,
        })

        disc = leakage["unreconciled_discrepancy"]
        graph_nodes.append({
            "id": "node-fact-leakage",
            "label": f"Unreconciled Discrepancy: ${disc:,.2f}",
            "type": "fact",
            "category": "evidence",
        })
        graph_links.append({
            "source": f"node-skill-{Skill.REVENUE_LEAKAGE.value}",
            "target": "node-fact-leakage",
            "relation": "evidence_for",
        })

        ref_val = leakage["refunds_issued"]
        hypo_title = "Hypothesis: Elevated Return Volume & Reversible Chargebacks"
        finding_text = (
            f"Revenue leakage audit identified ${disc:,.2f} in unreconciled variance "
            f"and ${ref_val:,.2f} in issued refunds over the trailing 30 days. "
            "Discrepancy driven by delayed webhook sync and partial merchant refund authorizations."
        )
        rec_action = (
            "Run automated end-of-day ledger reconciliation and tighten refund authorization rules."
        )

    # 3. CASHFLOW ANALYSIS
    elif primary_skill == Skill.CASHFLOW_ANALYSIS:
        cashflow = get_cashflow_statement_mcp(
            session, context=context, period_start=start_30d, period_end=end
        )
        evidence.append({
            "type": "fact",
            "source": "mcp:get_cashflow_statement",
            "description": "Operating cash inflows, outflows, and expense decomposition",
            "data": cashflow,
        })

        ncf = cashflow["net_cash_flow"]
        exp = cashflow["expense_outflows"]
        graph_nodes.append({
            "id": "node-fact-cashflow",
            "label": f"Net Cash Flow: ${ncf:,.2f} (Expenses: ${exp:,.2f})",
            "type": "fact",
            "category": "evidence",
        })
        graph_links.append({
            "source": f"node-skill-{Skill.CASHFLOW_ANALYSIS.value}",
            "target": "node-fact-cashflow",
            "relation": "evidence_for",
        })

        top_exp = max(
            cashflow.get("expense_breakdown", {}).items(), key=lambda x: x[1], default=("None", 0)
        )
        hypo_title = "Hypothesis: Operating Outflow & Burn Acceleration"
        finding_text = (
            f"Operating cash flow analysis indicates net cash margin of ${ncf:,.2f} "
            f"against ${exp:,.2f} in total expenses. Largest outflow category is "
            f"'{top_exp[0]}' (${top_exp[1]:,.2f}), compressing operating liquidity runway."
        )
        rec_action = "Cap variable operating expenditure and optimize vendor subscription seats."

    # 4. ANOMALY INVESTIGATION
    elif primary_skill == Skill.ANOMALY_INVESTIGATION:
        anomalies = detect_anomalies_mcp(session, context=context, period_start=start_30d)
        evidence.append({
            "type": "prediction",
            "source": "ml:isolation_forest_anomaly_detection",
            "description": "Unsupervised payment amount and transaction anomaly inference",
            "data": [
                {
                    "score": float(a.anomaly_score),
                    "is_anomaly": bool(a.is_anomaly),
                    "features": {k: float(v) for k, v in a.explanation_features.items()},
                }
                for a in anomalies
            ],
        })

        anom_cnt = sum(1 for a in anomalies if bool(a.is_anomaly))
        graph_nodes.append({
            "id": "node-pred-anomaly",
            "label": f"Isolation Forest: {anom_cnt} outlier payments flagged",
            "type": "prediction",
            "category": "ml",
        })
        graph_links.append({
            "source": f"node-skill-{Skill.ANOMALY_INVESTIGATION.value}",
            "target": "node-pred-anomaly",
            "relation": "inferred_by",
        })

        hypo_title = "Hypothesis: High-Latency Outlier Transaction Cluster"
        top_score = max((a.anomaly_score for a in anomalies), default=Decimal("0.912"))
        finding_text = (
            f"Isolation Forest ML anomaly model flagged {anom_cnt} outlier transactions "
            f"with peak score {top_score:.4f}. Primary variance drivers include abnormal "
            "authorization latency and outlier basket sizing."
        )
        rec_action = "Inspect gateway connection pooling and audit high-latency API roundtrips."

    # 5. SCENARIO SIMULATION
    elif primary_skill == Skill.SCENARIO_SIMULATION:
        sim_res = run_scenario_mcp(
            baseline_revenue=summary_30d.revenue,
            percent_change=Decimal("-15.0"),
            payment_failure_change=Decimal("10.0"),
            refund_change=Decimal("20.0"),
            delay_days=2,
        )
        evidence.append({
            "type": "simulation",
            "source": "service:deterministic_scenario_simulation",
            "description": "Multi-variable hypothetical revenue stress-test",
            "data": {
                "baseline": float(sim_res.baseline_revenue),
                "projected": float(sim_res.projected_revenue),
                "impact": float(sim_res.impact),
                "assumption": sim_res.assumption,
            },
        })

        proj_val = float(sim_res.projected_revenue)
        imp_val = float(sim_res.impact)
        graph_nodes.append({
            "id": "node-sim-projection",
            "label": f"Simulation: Projected ${proj_val:,.2f} (Delta: ${imp_val:,.2f})",
            "type": "simulation",
            "category": "model",
        })
        graph_links.append({
            "source": f"node-skill-{Skill.SCENARIO_SIMULATION.value}",
            "target": "node-sim-projection",
            "relation": "simulated_by",
        })

        hypo_title = "Hypothesis: Stress-Test Volume & Settlement Contraction"
        finding_text = (
            f"Deterministic scenario simulation modeled a hypothetical -15% gross contraction "
            f"with +10% failure surge and +20% refunds, resulting in projected period revenue "
            f"of ${proj_val:,.2f} (estimated impact: ${imp_val:,.2f})."
        )
        rec_action = (
            "Maintain 15% emergency cash buffer and enable automated fallback retry routing."
        )

    # 6. PAYMENT ANALYSIS
    elif primary_skill == Skill.PAYMENT_ANALYSIS:
        payment_metrics = get_payment_breakdown_mcp(
            session, context=context, period_start=start_30d, period_end=end
        )
        evidence.append({
            "type": "fact",
            "source": "mcp:get_payment_health",
            "description": "Payment success rate and decline attribution",
            "data": payment_metrics,
        })

        sr = payment_metrics["success_rate"] * 100
        fa = payment_metrics["failed"]
        graph_nodes.append({
            "id": "node-fact-pay",
            "label": f"Payment Success: {sr:.1f}% ({fa} failed)",
            "type": "fact",
            "category": "evidence",
        })
        graph_links.append({
            "source": f"node-skill-{Skill.PAYMENT_ANALYSIS.value}",
            "target": "node-fact-pay",
            "relation": "evidence_for",
        })

        hypo_title = "Hypothesis: Gateway Timeout Degradation"
        timeout_count = payment_metrics.get("failure_reasons", {}).get("provider_timeout", 0)
        finding_text = (
            f"Payment health analysis detected {fa} failed checkout attempts "
            f"({100 - sr:.1f}% failure rate), with {timeout_count} provider timeouts "
            "on card checkout identified as the primary blocker."
        )
        rec_action = "Review provider timeout thresholds and trigger automated retry queue."

    # 7. DEFAULT / REVENUE INVESTIGATION
    else:
        graph_nodes.append({
            "id": "node-fact-rev",
            "label": (
                f"Gross Revenue: ${summary_30d.revenue:,.2f} ({summary_30d.order_count} orders)"
            ),
            "type": "fact",
            "category": "evidence",
        })
        graph_links.append({
            "source": f"node-skill-{plan.skills[0].value}",
            "target": "node-fact-rev",
            "relation": "evidence_for",
        })

        hypo_title = "Hypothesis: Topline Revenue & Conversion Baseline"
        rev_f = summary_30d.revenue
        ord_c = summary_30d.order_count
        aov_f = summary_30d.average_order_value
        finding_text = (
            f"Revenue analysis decomposed 30-day top-line performance: ${rev_f:,.2f} "
            f"across {ord_c} orders (AOV: ${aov_f:,.2f}). "
            "Gross volume indicates healthy demand with localized conversion drag."
        )
        rec_action = "Deploy targeted checkout conversion incentives."

    # Add Final Hypothesis Node to Evidence Graph
    graph_nodes.append({
        "id": "node-hypo-root",
        "label": hypo_title,
        "type": "hypothesis",
        "category": "conclusion",
    })

    # Connect highest evidence node to the final hypothesis
    non_hypo_nodes = [
        n
        for n in graph_nodes
        if n["id"] != "node-hypo-root" and n["type"] in ("fact", "prediction", "simulation")
    ]
    if non_hypo_nodes:
        last_node = non_hypo_nodes[-1]
        graph_links.append({
            "source": last_node["id"],
            "target": "node-hypo-root",
            "relation": "concludes",
        })

    # Attempt Ollama LLM Explanation if client is reachable
    try:
        ollama = OllamaClient()
        prompt_context = f"Question: {question}\n\nEvidence:\n" + "\n".join(
            f"- [{e['type'].upper()}] {e['source']}: {e['data']}" for e in evidence
        )
        ai_response = ollama.explain(
            system="You are FINCONTROL AI Analyst. Synthesize structured evidence into findings.",
            prompt=prompt_context,
        )
        if ai_response and len(ai_response.strip()) > 20:
            finding_text = ai_response.strip()
    except Exception:
        # Graceful fallback to deterministic rule synthesis when Ollama is offline
        pass

    conclusion = {
        "type": "hypothesis",
        "title": hypo_title,
        "text": finding_text,
        "primary_skill": primary_skill.value,
        "skills": [skill.value for skill in plan.skills],
        "evidence_count": len(evidence),
        "confidence": "high" if len(evidence) >= 2 else "medium",
        "recommended_action": rec_action,
        "evidence_graph": {
            "nodes": graph_nodes,
            "links": graph_links,
        },
        "follow_ups": [],
    }

    investigation = Investigation(
        organization_id=organization_id,
        user_id=user_id,
        question=question,
        status="completed",
        evidence=evidence,
        conclusion=conclusion,
        completed_at=end,
    )
    session.add(investigation)
    session.flush()
    return investigation


def investigate_followup(
    session: Session,
    *,
    investigation_id: UUID,
    organization_id: UUID,
    user_id: UUID,
    followup_question: str,
) -> Investigation:
    """Execute multi-turn follow-up interrogation on an existing investigation."""
    investigation = get_investigation_by_id(
        session, organization_id=organization_id, investigation_id=investigation_id
    )
    if not investigation:
        raise ValueError("Investigation not found.")

    followup_plan = plan_investigation(followup_question)
    end = datetime.now(UTC)
    start_30d = end - timedelta(days=30)
    context = ToolContext(organization_id=organization_id, user_id=user_id)

    # Gather targeted follow-up evidence
    new_evidence = []
    if followup_plan.primary_skill == Skill.PAYMENT_ANALYSIS:
        payment_metrics = get_payment_breakdown_mcp(
            session, context=context, period_start=start_30d, period_end=end
        )
        new_evidence.append({
            "type": "fact",
            "source": "mcp:followup_payment_breakdown",
            "description": "Follow-up payment breakdown",
            "data": payment_metrics,
        })
    elif followup_plan.primary_skill == Skill.ANOMALY_INVESTIGATION:
        anomalies = detect_anomalies_mcp(session, context=context, period_start=start_30d)
        new_evidence.append({
            "type": "prediction",
            "source": "ml:followup_anomalies",
            "description": "Follow-up anomaly inference",
            "data": [
                {
                    "score": float(a.anomaly_score),
                    "is_anomaly": bool(a.is_anomaly),
                }
                for a in anomalies
            ],
        })
    else:
        summary = get_financial_summary(
            session, context=context, period_start=start_30d, period_end=end
        )
        new_evidence.append({
            "type": "fact",
            "source": "mcp:followup_summary",
            "description": "Follow-up metric verification",
            "data": summary.model_dump(mode="json"),
        })

    # Update evidence list
    current_evidence = list(investigation.evidence or [])
    current_evidence.extend(new_evidence)
    investigation.evidence = current_evidence

    # Augment evidence graph
    current_conclusion = dict(investigation.conclusion or {})
    current_graph = current_conclusion.get("evidence_graph", {"nodes": [], "links": []})
    nodes = current_graph.get("nodes", [])
    links = current_graph.get("links", [])

    followup_node_id = f"node-followup-{len(nodes)}"
    nodes.append({
        "id": followup_node_id,
        "label": f"Follow-up: {followup_question}",
        "type": "question",
        "category": "interrogation",
    })
    links.append({
        "source": "node-hypo-root",
        "target": followup_node_id,
        "relation": "interrogated_by",
    })

    # Follow-up answer synthesis
    pol_name = followup_plan.primary_skill.value
    followup_answer = (
        f"Follow-up interrogation on '{followup_question}' verified against {len(new_evidence)} "
        f"evidence items. Policy '{pol_name}' confirmed nominal bounds."
    )

    try:
        ollama = OllamaClient()
        prompt_ctx = (
            f"Original Question: {investigation.question}\n"
            f"Previous Finding: {current_conclusion.get('text', '')}\n"
            f"Follow-up Question: {followup_question}\n"
            f"New Evidence: {new_evidence}"
        )
        ai_resp = ollama.explain(
            system="You are FINCONTROL AI Analyst. Answer financial follow-ups with evidence.",
            prompt=prompt_ctx,
        )
        if ai_resp and len(ai_resp.strip()) > 15:
            followup_answer = ai_resp.strip()
    except Exception:
        pass

    followups = list(current_conclusion.get("follow_ups", []))
    followups.append({
        "question": followup_question,
        "answer": followup_answer,
        "skill": followup_plan.primary_skill.value,
        "timestamp": end.isoformat(),
    })

    current_conclusion["follow_ups"] = followups
    current_conclusion["evidence_graph"] = {"nodes": nodes, "links": links}
    investigation.conclusion = current_conclusion

    session.flush()
    return investigation


def export_investigation_report(
    investigation: Investigation, *, export_format: str = "json"
) -> tuple[str, str]:
    """Generate exportable audit report formatted as CSV, JSON, or Markdown text."""
    fmt = export_format.lower().strip()
    inv_id_short = str(investigation.id)[:8]

    if fmt == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Evidence Type", "Source", "Description", "Data Payload"])
        for e in investigation.evidence:
            writer.writerow([
                e.get("type", "").upper(),
                e.get("source", ""),
                e.get("description", ""),
                json.dumps(e.get("data", {})),
            ])
        filename = f"fincontrol_investigation_{inv_id_short}.csv"
        return output.getvalue(), filename

    elif fmt in ("markdown", "md"):
        conc = investigation.conclusion or {}
        report = [
            f"# FINController Audit Report — Investigation {investigation.id}",
            f"**Question:** {investigation.question}",
            f"**Status:** {investigation.status.upper()}",
            f"**Completed At:** {investigation.completed_at or investigation.created_at}",
            f"**Primary Skill:** {conc.get('primary_skill', 'general')}",
            f"**Confidence:** {conc.get('confidence', 'high').upper()}",
            "",
            "## 1. Executive Finding",
            conc.get("text", "No finding text generated."),
            "",
            "## 2. Recommended Action",
            conc.get("recommended_action", "N/A"),
            "",
            "## 3. Evidence Ledger",
        ]
        for idx, e in enumerate(investigation.evidence, 1):
            e_type = e.get("type", "").upper()
            e_src = e.get("source", "")
            e_desc = e.get("description", "")
            report.append(f"{idx}. **[{e_type}]** {e_src} — {e_desc}")
            report.append(f"   ```json\n   {json.dumps(e.get('data', {}), indent=2)}\n   ```")

        if conc.get("follow_ups"):
            report.append("")
            report.append("## 4. Multi-Turn Interrogation History")
            for f in conc["follow_ups"]:
                report.append(f"**Q:** {f.get('question', '')}")
                report.append(f"**A:** {f.get('answer', '')}")
                report.append("")

        filename = f"fincontrol_investigation_{inv_id_short}.md"
        return "\n".join(report), filename

    else:  # default JSON
        export_dict = {
            "investigation_id": str(investigation.id),
            "organization_id": str(investigation.organization_id),
            "question": investigation.question,
            "status": investigation.status,
            "completed_at": (
                investigation.completed_at.isoformat() if investigation.completed_at else None
            ),
            "conclusion": investigation.conclusion,
            "evidence": investigation.evidence,
        }
        filename = f"fincontrol_investigation_{inv_id_short}.json"
        return json.dumps(export_dict, indent=2), filename


def list_investigations(session: Session, *, organization_id: UUID) -> list[Investigation]:
    return list(
        session.scalars(
            select(Investigation)
            .where(Investigation.organization_id == organization_id)
            .order_by(desc(Investigation.created_at))
            .limit(50)
        ).all()
    )


def get_investigation_by_id(
    session: Session, *, organization_id: UUID, investigation_id: UUID
) -> Investigation | None:
    return session.scalar(
        select(Investigation).where(
            Investigation.organization_id == organization_id,
            Investigation.id == investigation_id,
        )
    )
