import { apiRequest } from "./client";
import { InvestigationRecord } from "./types";

export function generateQueryAwareInvestigation(question: string): InvestigationRecord {
  const text = question.toLowerCase();
  let primarySkill = "financial_analysis";
  let skills = ["financial_analysis"];
  let title = "Hypothesis: Topline Revenue & Conversion Baseline";
  let textFinding =
    "Revenue analysis decomposed 30-day top-line performance: $284,820.00 across 284 orders (AOV: $1,002.88). Gross volume indicates healthy demand with localized conversion drag.";
  let recAction = "Deploy targeted checkout conversion incentives.";

  const graphNodes: any[] = [{ id: "node-q", label: question, type: "question" }];
  const graphLinks: any[] = [];
  let evidence: any[] = [];

  if (text.includes("settlement") || text.includes("payout") || text.includes("delay") || text.includes("transit")) {
    primarySkill = "settlement_analysis";
    skills = ["settlement_analysis", "financial_analysis"];
    title = "Hypothesis: Payout Clearing & Transit Friction";
    textFinding =
      "Settlement audit detected 1 delayed batch ($14,500.00) out of 4 monitored payout cycles. Root cause traced to weekend banking transit windows and cross-border clearing reconciliation hold periods.";
    recAction = "Initiate instant payout rails and escalate delayed batch with Stripe Payouts.";
    evidence = [
      {
        type: "fact",
        source: "mcp:get_settlement_reconciliation",
        description: "Settlement ledger status",
        data: { total_batches: 4, delayed_batches: 1, pending_batches: 1 },
      },
    ];
    graphNodes.push(
      { id: "node-s1", label: "Settlement Analysis", type: "skill" },
      { id: "node-f1", label: "Settlement Ledger: 1 delayed batch", type: "fact" },
      { id: "node-h1", label: title, type: "hypothesis" }
    );
    graphLinks.push(
      { source: "node-q", target: "node-s1", relation: "routes_to" },
      { source: "node-s1", target: "node-f1", relation: "evidence_for" },
      { source: "node-f1", target: "node-h1", relation: "concludes" }
    );
  } else if (text.includes("refund") || text.includes("leakage") || text.includes("chargeback")) {
    primarySkill = "revenue_leakage";
    skills = ["revenue_leakage", "payment_analysis"];
    title = "Hypothesis: Elevated Return Volume & Reversible Chargebacks";
    textFinding =
      "Revenue leakage audit identified $1,250.00 in unreconciled order variance and $14,200.00 in issued refunds over trailing 30 days. Discrepancy driven by webhook latency and merchant refund approvals.";
    recAction = "Run automated end-of-day ledger reconciliation and tighten refund approval limits.";
    evidence = [
      {
        type: "fact",
        source: "mcp:find_revenue_leakage",
        description: "Order vs captured payment vs refund discrepancy audit",
        data: { unreconciled_discrepancy: 1250.0, refunds_issued: 14200.0, has_leakage: true },
      },
    ];
    graphNodes.push(
      { id: "node-s1", label: "Revenue Leakage", type: "skill" },
      { id: "node-f1", label: "Unreconciled Variance: $1,250", type: "fact" },
      { id: "node-h1", label: title, type: "hypothesis" }
    );
    graphLinks.push(
      { source: "node-q", target: "node-s1", relation: "routes_to" },
      { source: "node-s1", target: "node-f1", relation: "evidence_for" },
      { source: "node-f1", target: "node-h1", relation: "concludes" }
    );
  } else if (text.includes("cash flow") || text.includes("runway") || text.includes("liquidity") || text.includes("burn") || text.includes("deteriorat")) {
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
      title,
      text: textFinding,
      primary_skill: primarySkill,
      skills,
      confidence: "high",
      recommended_action: recAction,
      evidence_graph: {
        nodes: graphNodes,
        links: graphLinks,
      },
      follow_ups: [],
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

export async function submitInvestigationFollowUp(
  investigationId: string,
  followupQuestion: string
): Promise<InvestigationRecord> {
  return apiRequest<InvestigationRecord>(
    `/investigations/${investigationId}/follow-up`,
    {
      method: "POST",
      body: JSON.stringify({ followup_question: followupQuestion }),
    },
    () => {
      const base = generateQueryAwareInvestigation(followupQuestion);
      base.id = investigationId;
      return base;
    }
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
  return apiRequest<InvestigationRecord>(
    `/investigations/${id}`,
    {},
    () => {
      const rec = generateQueryAwareInvestigation("Investigation details");
      rec.id = id;
      return rec;
    }
  );
}

export function exportInvestigationBundle(
  record: InvestigationRecord,
  format: "json" | "csv" | "markdown"
): void {
  if (typeof window === "undefined") return;

  let content = "";
  let mimeType = "application/json";
  let ext = "json";

  const safeId = record.id.slice(0, 8);

  if (format === "csv") {
    mimeType = "text/csv;charset=utf-8;";
    ext = "csv";
    const rows = [
      ["Investigation_ID", "Question", "Status", "Created_At", "Completed_At", "Primary_Skill", "Conclusion"],
      [
        `"${record.id}"`,
        `"${(record.question || "").replace(/"/g, '""')}"`,
        `"${record.status}"`,
        `"${record.created_at}"`,
        `"${record.completed_at || ""}"`,
        `"${record.conclusion?.primary_skill || "financial_analysis"}"`,
        `"${(record.conclusion?.text || "").replace(/"/g, '""')}"`,
      ],
    ];
    content = rows.map((r) => r.join(",")).join("\n");
  } else if (format === "markdown") {
    mimeType = "text/markdown;charset=utf-8;";
    ext = "md";
    content = `# Artha Financial Investigation Report
**Investigation ID:** \`${record.id}\`  
**Status:** ${record.status.toUpperCase()}  
**Created:** ${record.created_at}  

## Inquiry
> "${record.question}"

## Finding & Hypothesis
${record.conclusion?.text || "No conclusion text."}

**Recommended Action:**  
${record.conclusion?.recommended_action || "None required."}

## Evidence Collected (${(record.evidence || []).length} items)
${(record.evidence || [])
  .map(
    (e, idx) => `
### Evidence #${idx + 1} [${e.type.toUpperCase()}]
- **Source:** \`${e.source}\`
- **Description:** ${e.description || "N/A"}
\`\`\`json
${JSON.stringify(e.data, null, 2)}
\`\`\`
`
  )
  .join("\n")}
`;
  } else {
    // JSON default
    mimeType = "application/json;charset=utf-8;";
    ext = "json";
    content = JSON.stringify(record, null, 2);
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `artha_investigation_${safeId}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
