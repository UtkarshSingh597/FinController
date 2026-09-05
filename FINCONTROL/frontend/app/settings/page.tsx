"use client";

import React, { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { NavSidebar } from "../../components/ui/nav-sidebar";
import { uploadCSVStatement } from "../../lib/api";

export default function SettingsPage() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleUpload = async () => {
    if (!csvFile || uploadLoading) return;
    setUploadLoading(true);
    setUploadStatus("Uploading and parsing ledger statements...");
    try {
      const res = await uploadCSVStatement(csvFile);
      setUploadStatus(
        `Success: Ingested ${res.total_processed} rows (${res.orders_created} orders, ${res.payments_created} payments, ${res.expenses_created} expenses).`
      );
      setCsvFile(null);
    } catch (err: any) {
      setUploadStatus(`Error: ${err.message || "Failed to parse CSV statement"}`);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <NavSidebar />

      <main className="main-content">
        <header className="page-header">
          <div>
            <div className="eyebrow">SYSTEM CONFIGURATION & SECURITY CONTROLS</div>
            <h1 className="page-title">Settings & Governance</h1>
            <p className="page-subtitle">
              Tenant identity, Model Context Protocol (MCP) capability boundaries, and live data ingestion connectors.
            </p>
          </div>
        </header>

        <div className="grid-equal">
          {/* Tenant Identity Panel */}
          <article className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">TENANT CONFIGURATION</div>
                <h3 className="panel-title">Active Organization Scope</h3>
              </div>
              <Badge type="fact">AUTHENTICATED</Badge>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "10.5px", display: "block", fontFamily: "var(--font-mono)" }}>
                  ORGANIZATION NAME
                </span>
                <strong style={{ color: "var(--text-primary)" }}>NovaPay FinTech Inc.</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "10.5px", display: "block", fontFamily: "var(--font-mono)" }}>
                  ORGANIZATION SLUG
                </span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>novapay-fintech</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "10.5px", display: "block", fontFamily: "var(--font-mono)" }}>
                  TENANT ISOLATION POLICY
                </span>
                <span style={{ color: "var(--text-secondary)" }}>Verified Principal Binding (org_id enforced on all queries)</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "10.5px", display: "block", fontFamily: "var(--font-mono)" }}>
                  DATABASE DRIVER
                </span>
                <span style={{ color: "var(--text-secondary)" }}>PostgreSQL 16 via SQLAlchemy 2.0 + Psycopg 3</span>
              </div>
            </div>
          </article>

          {/* AI Model & MCP Boundaries */}
          <article className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">AI & MCP GOVERNANCE</div>
                <h3 className="panel-title">Model Context Boundary</h3>
              </div>
              <Badge type="fact">RESTRICTED</Badge>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "10.5px", display: "block", fontFamily: "var(--font-mono)" }}>
                  REASONING PROVIDER
                </span>
                <strong style={{ color: "var(--text-primary)" }}>Qwen3 8B (via Local Ollama Adapter)</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "10.5px", display: "block", fontFamily: "var(--font-mono)" }}>
                  DATABASE DIRECT ACCESS
                </span>
                <span style={{ color: "var(--semantic-critical-text)", fontWeight: 600 }}>BLOCKED (Zero direct SQL execution)</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "10.5px", display: "block", fontFamily: "var(--font-mono)" }}>
                  MCP TOOL PERMISSIONS
                </span>
                <span style={{ color: "var(--text-secondary)" }}>Read-Only Structured Financial Summaries & ML Inferences</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "10.5px", display: "block", fontFamily: "var(--font-mono)" }}>
                  EVIDENCE LABELING ENFORCEMENT
                </span>
                <span style={{ color: "var(--text-secondary)" }}>Mandatory FACT / PREDICTION / HYPOTHESIS / SIMULATION tags</span>
              </div>
            </div>
          </article>
        </div>

        {/* Data Ingestion Connectors (CSV + Webhooks) */}
        <section className="panel" style={{ marginTop: "20px" }}>
          <div className="panel-header">
            <div>
              <div className="eyebrow">DATA INGESTION & CONNECTORS</div>
              <h3 className="panel-title">Statement Importer & Webhook Endpoints</h3>
            </div>
            <Badge type="fact">READY</Badge>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* CSV Bank Statement Uploader */}
            <div style={{ padding: "14px", background: "var(--bg-surface-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)" }}>
              <div className="eyebrow" style={{ marginBottom: "4px" }}>CSV STATEMENT UPLOADER</div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                Import standard bank or processor CSV files directly into your tenant ledger.
              </p>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                />
                <button
                  className="btn btn-primary"
                  style={{ fontSize: "12px", padding: "6px 12px" }}
                  onClick={handleUpload}
                  disabled={!csvFile || uploadLoading}
                >
                  {uploadLoading ? "Processing..." : "Upload Statement"}
                </button>
              </div>
              {uploadStatus && (
                <div style={{ fontSize: "12px", padding: "8px 10px", borderRadius: "var(--radius-xs)", background: uploadStatus.startsWith("Error") ? "var(--semantic-critical-bg)" : "var(--semantic-positive-bg)", color: uploadStatus.startsWith("Error") ? "var(--semantic-critical-text)" : "var(--semantic-positive-text)", border: uploadStatus.startsWith("Error") ? "1px solid var(--semantic-critical-border)" : "1px solid var(--semantic-positive-border)" }}>
                  {uploadStatus}
                </div>
              )}
            </div>

            {/* Live Webhook Endpoints */}
            <div style={{ padding: "14px", background: "var(--bg-surface-elevated)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)" }}>
              <div className="eyebrow" style={{ marginBottom: "4px" }}>CONFIGURED WEBHOOKS</div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                Configure incoming webhook notifications from Stripe and Adyen.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                <div style={{ padding: "6px 10px", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
                  <span style={{ color: "var(--text-muted)", marginRight: 8 }}>POST</span> /api/v1/webhooks/stripe
                </div>
                <div style={{ padding: "6px 10px", background: "var(--bg-surface-subtle)", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
                  <span style={{ color: "var(--text-muted)", marginRight: 8 }}>POST</span> /api/v1/webhooks/adyen
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skill Registry Table */}
        <section className="panel" style={{ marginTop: "20px" }}>
          <div className="panel-header">
            <div>
              <div className="eyebrow">REASONING LAYER</div>
              <h3 className="panel-title">Active AI Skill Policies (10 Configured)</h3>
            </div>
            <Badge type="fact">POLICIES ACTIVE</Badge>
          </div>

          <div className="table-container">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Skill Policy Name</th>
                  <th>Primary Specialty</th>
                  <th>Permitted Capabilities</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["investigation_orchestrator", "Question routing & evidence synthesis", "Skill dispatcher", "Active"],
                  ["financial_analysis", "KPI baseline & health comparison", "Read-only summary", "Active"],
                  ["revenue_investigation", "Revenue decline & surge decomposition", "Order & payment inspection", "Active"],
                  ["anomaly_investigation", "Outlier transaction & latency detection", "Isolation Forest ML", "Active"],
                  ["payment_analysis", "Gateway decline & timeout attribution", "Payment attempts inspection", "Active"],
                  ["settlement_analysis", "Settlement timing & delay analysis", "Batch ledger inspection", "Active"],
                  ["revenue_leakage", "Reconciliation mismatch detection", "Order-to-settlement mapping", "Active"],
                  ["cashflow_analysis", "Liquidity burn & runway projections", "Cash flow calculation", "Active"],
                  ["risk_assessment", "Financial volatility & stability scoring", "Risk metric formulation", "Active"],
                  ["scenario_simulation", "What-if stress testing & projections", "Deterministic simulation engine", "Active"],
                ].map(([name, spec, caps, st], idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)" }}>{name}</td>
                    <td>{spec}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{caps}</td>
                    <td>
                      <Badge type="fact">{st}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
