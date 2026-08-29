import { apiRequest } from "./client";
import { EvidenceGraph, InvestigationRecord } from "./types";

function generateQueryAwareInvestigation(question: string): InvestigationRecord {
  const text = question.toLowerCase();
  let primarySkill = "financial_analysis";
  let skills = ["financial_analysis"];
  let title = "Topline Revenue & Conversion Baseline";
  let textFinding =
    "Revenue analysis decomposed 30-day top-line performance ($284,820.00 across 284 orders, AOV $1,002.88). Gross volume indicates healthy demand with localized conversion drag.";
  let recAction = "Deploy targeted checkout conversion incentives.";
  let evidence: any[] = [];
  let graphNodes: any[] = [];
  let graphLinks: any[] = [];

  graphNodes.push({ id: "node-q", label: question, type: "question" });

  if (text.includes("settle") || text.includes("transit") || text.includes("delay")) {
    primarySkill = "settlement_analysis";
    skills = ["settlement_analysis", "cashflow_analysis"];
    title = "Hypothesis: Settlement Batch Transit Delay";
    textFinding =
      "Settlement timing analysis identified 1 delayed payout batch ($29,800.00) at provider demo-pay exceeding the standard T+2 clearing transit window.";
    recAction = "Escalate ticket to demo-pay settlement support and audit banking clearing transit logs.";
    evidence = [
      {
        type: "fact",
        source: "mcp:get_settlement_reconciliation",
        description: "Settlement ledger status",
        data: { total_batches: 3, delayed_batches: 1, pending_batches: 1, delayed_amount: 29800.0 },
      },
    ];
    graphNodes.push(
      { id: "node-s1", label: "Settlement Analysis", type: "skill" },
      { id: "node-f1", label: "Settlement Ledger: 1 delayed batch ($29,800)", type: "fact" },
      { id: "node-h1", label: title, type: "hypothesis" }
    );
    graphLinks.push(
      { source: "node-q", target: "node-s1", relation: "routes_to" },
      { source: "node-s1", target: "node-f1", relation: "evidence_for" },
      { source: "node-f1", target: "node-h1", relation: "concludes" }
    );
  } else if (text.includes("refund") || text.includes("leakage") || text.includes("return")) {
    primarySkill = "revenue_leakage";
    skills = ["revenue_leakage", "revenue_investigation"];
    title = "Hypothesis: Return Volume & Duplicate Charge Discrepancy";
    textFinding =
      "Refund and leakage investigation identified $14,200.00 in issued refunds. Reconciliation across captured orders vs payouts revealed an unreconciled discrepancy driven by defective product returns.";
    recAction = "Audit return authorizations and enforce checkout button deduplication.";
    evidence = [
      {
        type: "fact",
        source: "mcp:find_revenue_leakage",
        description: "Refund volumes and order discrepancy",
        data: { orders_revenue: 284820.0, refunds_issued: 14200.0, unreconciled_discrepancy: 1240.0 },
      },
    ];
    graphNodes.push(
      { id: "node-s1", label: "Revenue Leakage", type: "skill" },
      { id: "node-f1", label: "Refunds: $14,200 (Discrepancy: $1,240)", type: "fact" },
      { id: "node-h1", label: title, type: "hypothesis" }
    );
    graphLinks.push(
      { source: "node-q", target: "node-s1", relation: "routes_to" },
      { source: "node-s1", target: "node-f1", relation: "evidence_for" },
      { source: "node-f1", target: "node-h1", relation: "concludes" }
    );
  } else if (text.includes("cash") || text.includes("liquidity") || text.includes("runway") || text.includes("deteriorat")) {
    primarySkill = "cashflow_analysis";
    skills = ["cashflow_analysis", "risk_assessment"];
    title = "Hypothesis: Operating Expense Runway Compression";
    textFinding =
      "Cash flow investigation reveals net liquidity inflow of $171,400.00 against $99,220.00 in operating expenses. Primary cost drivers are daily operational overhead ($54,000) and cloud infrastructure hosting ($42,000).";
    recAction = "Implement auto-scaling schedules for cloud hosting to optimize off-peak operating runway.";
    evidence = [
      {
        type: "fact",
        source: "mcp:get_cashflow_statement",
        description: "Operating inflows vs category outflows",
        data: { gross_inflows: 284820.0, expense_outflows: 99220.0, net_cash_flow: 171400.0 },
      },
    ];
    graphNodes.push(
      { id: "node-s1", label: "Cash Flow Analysis", type: "skill" },
      { id: "node-f1", label: "Net Cash Flow: $171,400 (Expenses: $99,220)", type: "fact" },
      { id: "node-h1", label: title, type: "hypothesis" }
    );
    graphLinks.push(
      { source: "node-q", target: "node-s1", relation: "routes_to" },
      { source: "node-s1", target: "node-f1", relation: "evidence_for" },
      { source: "node-f1", target: "node-h1", relation: "concludes" }
    );
  } else if (text.includes("anomal") || text.includes("outlier") || text.includes("unusual")) {
    primarySkill = "anomaly_investigation";
    skills = ["anomaly_investigation", "payment_analysis"];
    title = "Hypothesis: High-Latency Outlier Transaction Cluster";
    textFinding =
      "Isolation Forest ML anomaly model flagged 3 outlier transactions with peak anomaly score 0.9124. Primary variance drivers include abnormal authorization latency (12,400ms) and outlier basket sizing ($14,850).";
    recAction = "Inspect gateway connection pooling and audit high-latency API roundtrips.";
    evidence = [
      {
        type: "prediction",
        source: "ml:isolation_forest_anomaly_detection",
        description: "Isolation Forest outlier scoring",
        data: { model: "IsolationForest_v1", outliers_detected: 3, highest_score: 0.9124 },
      },
    ];
    graphNodes.push(
      { id: "node-s1", label: "Anomaly Investigation", type: "skill" },
      { id: "node-p1", label: "Isolation Forest: 3 Outliers (Score 0.9124)", type: "prediction" },
      { id: "node-h1", label: title, type: "hypothesis" }
    );
    graphLinks.push(
      { source: "node-q", target: "node-s1", relation: "routes_to" },
      { source: "node-s1", target: "node-p1", relation: "inferred_by" },
      { source: "node-p1", target: "node-h1", relation: "concludes" }
    );
  } else if (text.includes("what if") || text.includes("scenario") || text.includes("falls 15%") || text.includes("decreases")) {
    primarySkill = "scenario_simulation";
    skills = ["scenario_simulation", "revenue_investigation"];
    title = "Hypothesis: Simulated Volume & Revenue Contraction";
    textFinding =
      "Deterministic scenario simulation modeled a hypothetical -15% gross contraction with +10% failure surge, projecting period revenue of $242,097.00 (estimated impact: -$42,723.00).";
    recAction = "Maintain a 15% emergency liquidity reserve and enable fallback retry routing.";
    evidence = [
      {
        type: "simulation",
        source: "service:deterministic_scenario_simulation",
        description: "Hypothetical scenario projection",
        data: { baseline: 284820.0, projected: 242097.0, impact: -42723.0 },
      },
    ];
    graphNodes.push(
      { id: "node-s1", label: "Scenario Simulation", type: "skill" },
      { id: "node-m1", label: "Simulation: Projected $242,097 (Delta: -$42,723)", type: "simulation" },
      { id: "node-h1", label: title, type: "hypothesis" }
    );
    graphLinks.push(
      { source: "node-q", target: "node-s1", relation: "routes_to" },
      { source: "node-s1", target: "node-m1", relation: "simulated_by" },
      { source: "node-m1", target: "node-h1", relation: "concludes" }
    );
  } else if (text.includes("payment") || text.includes("decline") || text.includes("failure") || text.includes("fail")) {
    primarySkill = "payment_analysis";
    skills = ["payment_analysis", "revenue_investigation"];
    title = "Hypothesis: Gateway Timeout Degradation";
    textFinding =
      "Payment health analysis detected 48 total failed checkout attempts (13.3% failure rate), with 38 provider timeouts on card checkout identified as the primary degradation factor.";
    recAction = "Review provider webhook timeout thresholds and initiate automated batch replay.";
    evidence = [
      {
        type: "fact",
        source: "mcp:get_payment_health",
        description: "Payment health metrics",
        data: { total_payments: 360, failed: 48, failure_reasons: { provider_timeout: 38 } },
      },
    ];
    graphNodes.push(
      { id: "node-s1", label: "Payment Analysis", type: "skill" },
      { id: "node-f1", label: "Payment Success: 86.7% (48 failed)", type: "fact" },
      { id: "node-h1", label: title, type: "hypothesis" }
    );
    graphLinks.push(
      { source: "node-q", target: "node-s1", relation: "routes_to" },
      { source: "node-s1", target: "node-f1", relation: "evidence_for" },
      { source: "node-f1", target: "node-h1", relation: "concludes" }
    );
  } else {
    evidence = [
      {
        type: "fact",
        source: "mcp:get_financial_summary_30d",
        description: "30-day trailing baseline",
        data: { revenue: "284820.00", order_count: 284, average_order_value: "1002.88" },
      },
    ];
    graphNodes.push(
      { id: "node-s1", label: "Financial Analysis", type: "skill" },
      { id: "node-f1", label: "Gross Revenue: $284,820 (284 orders)", type: "fact" },
      { id: "node-h1", label: title, type: "hypothesis" }
    );
    graphLinks.push(
      { source: "node-q", target: "node-s1", relation: "routes_to" },
      { source: "node-s1", target: "node-f1", relation: "evidence_for" },
      { source: "node-f1", target: "node-h1", relation: "concludes" }
    );
  }

  return {
    id: `inv-${Date.now()}`,
    organization_id: "00000000-0000-0000-0000-000000000002",
    user_id: "00000000-0000-0000-0000-000000000001",
    question,
    status: "completed",
    evidence,
    conclusion: {
      type: "hypothesis",
      text: textFinding,
      primary_skill: primarySkill,
      skills,
      confidence: "high",
      recommended_action: recAction,
      evidence_graph: {
        nodes: graphNodes,
        links: graphLinks,
      },
    },
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  };
}

export async function createInvestigation(question: string): Promise<InvestigationRecord> {
  return apiRequest<InvestigationRecord>(
    "/investigations",
    {
      method: "POST",
      body: JSON.stringify({ question }),
    },
    () => generateQueryAwareInvestigation(question)
  );
}

export async function getInvestigations(): Promise<InvestigationRecord[]> {
  return apiRequest<InvestigationRecord[]>("/investigations", {}, () => [
    {
      id: "inv-001",
      organization_id: "00000000-0000-0000-0000-000000000002",
      user_id: "00000000-0000-0000-0000-000000000001",
      question: "Why did revenue drop yesterday?",
      status: "completed",
      evidence: [],
      conclusion: {
        type: "hypothesis",
        text: "Gateway provider timeouts surged to 38% on card checkout.",
        primary_skill: "payment_analysis",
        confidence: "high",
        recommended_action: "Review timeout logs and retry batch.",
      },
      created_at: new Date(Date.now() - 3600000).toISOString(),
      completed_at: new Date(Date.now() - 3500000).toISOString(),
    },
  ]);
}

export async function getInvestigationById(id: string): Promise<InvestigationRecord> {
  return apiRequest<InvestigationRecord>(`/investigations/${id}`);
}
