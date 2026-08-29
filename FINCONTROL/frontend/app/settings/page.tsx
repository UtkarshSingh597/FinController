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

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>
                  ORGANIZATION NAME
                </span>
                <strong>Acme FinTech Inc.</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>
                  ORGANIZATION SLUG
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>acme-fintech</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>
                  TENANT ISOLATION POLICY
                </span>
                <span>Verified Principal Binding (org_id required on all queries)</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>
                  DATABASE DRIVER
                </span>
                <span>PostgreSQL via SQLAlchemy 2.0 + Psycopg 3</span>
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

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>
                  LLM REASONING PROVIDER
                </span>
                <strong>Qwen3 8B (via Local Ollama Adapter)</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>
                  DATABASE DIRECT ACCESS
                </span>
                <span style={{ color: "#ef4444", fontWeight: 600 }}>BLOCKED (Zero direct SQL allowed)</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>
                  MCP TOOL PERMISSIONS
                </span>
                <span>Read-Only Structured Financial Summaries & ML Inferences</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", fontSize: "11px", display: "block" }}>
                  EVIDENCE LABELING ENFORCEMENT
                </span>
                <span>Mandatory FACT / PREDICTION / HYPOTHESIS / SIMULATION tags</span>
              </div>
            </div>
          </article>
        </div>

        {/* Data Ingestion Connectors (CSV + Webhooks) */}
        <section className="panel" style={{ marginTop: "24px" }}>
          <div className="panel-header">
            <div>
              <div className="eyebrow">DATA INGESTION & CONNECTORS</div>
              <h3 className="panel-title">Statement Importer & Webhook Endpoints</h3>
            </div>
            <Badge type="fact">INGESTION READY</Badge>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* CSV Bank Statement Uploader */}
            <div style={{ padding: "16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div className="eyebrow" style={{ color: "var(--accent-cyan)", marginBottom: "6px" }}>CSV STATEMENT UPLOADER</div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                Import standard bank or processor CSV files directly into your tenant ledger.
              </p>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                />
                <button
                  className="btn btn-primary"
                  style={{ fontSize: "12px", padding: "6px 14px" }}
                  onClick={handleUpload}
                  disabled={!csvFile || uploadLoading}
                >
                  {uploadLoading ? "Uploading..." : "Upload Statement"}
                </button>
              </div>
              {uploadStatus && (
                <div style={{ fontSize: "12px", padding: "8px 12px", borderRadius: "4px", background: uploadStatus.startsWith("Error") ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)", color: uploadStatus.startsWith("Error") ? "#f87171" : "#4ade80" }}>
                  {uploadStatus}
                </div>
              )}
            </div>

            {/* Live Webhook Endpoints */}
            <div style={{ padding: "16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
              <div className="eyebrow" style={{ color: "var(--accent-lime)", marginBottom: "6px" }}>CONFIGURED WEBHOOKS</div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                Configure incoming webhook notifications from Stripe and Adyen.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                <div style={{ padding: "6px 10px", background: "rgba(0,0,0,0.3)", borderRadius: "4px" }}>
                  <span style={{ color: "var(--accent-cyan)" }}>POST</span> /api/v1/webhooks/stripe
                </div>
                <div style={{ padding: "6px 10px", background: "rgba(0,0,0,0.3)", borderRadius: "4px" }}>
                  <span style={{ color: "var(--accent-cyan)" }}>POST</span> /api/v1/webhooks/adyen
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skill Registry Table */}
        <section className="panel" style={{ marginTop: "24px" }}>
          <div className="panel-header">
            <div>
              <div className="eyebrow">REASONING LAYER</div>
              <h3 className="panel-title">Active AI Skill Policies (10 Configured)</h3>
            </div>
            <Badge type="fact">ACTIVE POLICIES</Badge>
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
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{name}</td>
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
