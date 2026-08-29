"use client";

import React from "react";
import { Badge } from "../../components/ui/badge";
import { NavSidebar } from "../../components/ui/nav-sidebar";

export default function SettingsPage() {
  return (
    <div className="app-layout">
      <NavSidebar />

      <main className="main-content">
        <header className="page-header">
          <div>
            <div className="eyebrow">SYSTEM CONFIGURATION & SECURITY CONTROLS</div>
            <h1 className="page-title">Settings & Governance</h1>
            <p className="page-subtitle">
              Tenant identity, Model Context Protocol (MCP) capability boundaries, and AI model routing rules.
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
                <span style={{ color: "#dc2626", fontWeight: 600 }}>BLOCKED (Zero direct SQL allowed)</span>
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
