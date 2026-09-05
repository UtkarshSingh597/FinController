"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BreakdownChart } from "../components/charts/breakdown-chart";
import { RevenueChart } from "../components/charts/revenue-chart";
import { Badge } from "../components/ui/badge";
import { KpiCard } from "../components/ui/kpi-card";
import { NavSidebar } from "../components/ui/nav-sidebar";
import {
  SlidersIcon,
  AnalystIcon,
  ArrowRightIcon,
} from "../components/ui/icons";
import {
  FinancialSummary,
  getFinancialSummary,
  getPaymentBreakdown,
  getRevenueTrajectory,
  PaymentBreakdown,
  RevenueDataPoint,
} from "../lib/api";

const SAMPLE_QUERIES = [
  "Why did revenue fall over the last 3 days?",
  "Why are card payments declining with provider timeouts?",
  "What if refunds increase by 40% next 3 months?",
  "Which payment transactions are anomalous?",
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [trajectory, setTrajectory] = useState<RevenueDataPoint[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentBreakdown | null>(null);
  const [inquiry, setInquiry] = useState("");

  useEffect(() => {
    getFinancialSummary().then(setSummary);
    getRevenueTrajectory().then(setTrajectory);
    getPaymentBreakdown().then(setPaymentData);
  }, []);

  const failureItems = paymentData
    ? Object.entries(paymentData.failure_reasons).map(([reason, count]) => ({
        label: reason.replace(/_/g, " "),
        count,
      }))
    : [
        { label: "provider timeout", count: 38, color: "#f87171" },
        { label: "insufficient funds", count: 6, color: "#fbbf24" },
        { label: "card declined", count: 4, color: "#9cb1a8" },
      ];

  return (
    <div className="app-layout">
      <NavSidebar />

      <main className="main-content">
        <header className="page-header">
          <div>
            <div className="eyebrow">FINANCIAL INTELLIGENCE CONTROL TOWER</div>
            <h1 className="page-title">Executive Command Center</h1>
            <p className="page-subtitle">
              Continuous multi-tenant financial monitoring, unsupervised ML anomaly detection, and policy-driven incident investigations.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/scenarios" className="btn btn-secondary">
              <SlidersIcon size={14} color="currentColor" />
              <span>Simulate Scenario</span>
            </Link>
            <Link href="/ai-analyst" className="btn btn-primary">
              <AnalystIcon size={14} color="currentColor" />
              <span>New Investigation</span>
            </Link>
          </div>
        </header>

        {/* Level 1: Primary Financial Position */}
        <section className="metrics-grid">
          <KpiCard
            label="Gross Revenue (30d)"
            value={summary ? `$${Number(summary.revenue).toLocaleString()}` : "$284,820"}
            trend="+8.4%"
            trendDirection="up"
            subtext="vs previous period"
          />
          <KpiCard
            label="Payment Success Rate"
            value={
              summary
                ? `${(Number(summary.payment_success_rate) * 100).toFixed(1)}%`
                : "96.8%"
            }
            trend="-3.2%"
            trendDirection="down"
            subtext="gateway timeout spike"
          />
          <KpiCard
            label="Net Available Cash"
            value={
              summary
                ? `$${Number(summary.net_cash_flow).toLocaleString()}`
                : "$171,400"
            }
            trend="+$12,900"
            trendDirection="up"
            subtext="liquid reserves"
          />
          <KpiCard
            label="Pending Settlements"
            value={
              summary
                ? `$${Number(summary.pending_settlement).toLocaleString()}`
                : "$38,420"
            }
            subtext="3 batches in transit"
          />
        </section>

        {/* Level 2: Trends & Critical Operational Signals */}
        <div className="grid-2col">
          {/* Revenue Chart Panel */}
          <article className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">REVENUE TRAJECTORY</div>
                <h3 className="panel-title">30-Day Daily Inflow vs Baseline</h3>
              </div>
              <Badge type="fact">FACT</Badge>
            </div>
            <RevenueChart data={trajectory} baseline={8500} />
          </article>

          {/* Operational Signal Card */}
          <article
            className="panel"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="eyebrow" style={{ color: "var(--semantic-critical-text)" }}>
                  OPERATIONAL SIGNAL
                </span>
                <Badge type="critical">CRITICAL</Badge>
              </div>
              <h3 style={{ fontSize: "16px", margin: "10px 0 8px", color: "var(--text-primary)", fontWeight: 600 }}>
                Payment Timeout Spike
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5" }}>
                Provider timeout failure rate increased to <strong>38%</strong> over the past 3 days. Estimated uncaptured conversion volume: <strong>$14,200</strong>.
              </p>
            </div>
            <div style={{ marginTop: "16px" }}>
              <Link
                href="/ai-analyst?q=Why+did+revenue+fall+due+to+payment+failures"
                className="btn btn-secondary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <span>Launch Root-Cause Investigation</span>
                <ArrowRightIcon size={13} color="currentColor" />
              </Link>
            </div>
          </article>
        </div>

        {/* Level 3: Breakdowns & Investigation Inquiry */}
        <div className="grid-equal">
          {/* Failure Breakdown */}
          <article className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">GATEWAY HEALTH</div>
                <h3 className="panel-title">Decline & Failure Distribution</h3>
              </div>
              <Badge type="fact">FACT</Badge>
            </div>
            <BreakdownChart items={failureItems} />
          </article>

          {/* Quick Investigation Bar */}
          <article
            className="panel"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div className="eyebrow">INVESTIGATION WORKSPACE</div>
              <h3 className="panel-title">Query Financial Telemetry</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: "4px 0 12px", lineHeight: 1.45 }}>
                Submit a financial question to execute deterministic queries, ML anomaly evaluations, and causal evidence synthesis.
              </p>

              {/* Sample Queries */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
                {SAMPLE_QUERIES.slice(0, 3).map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="sample-pill"
                    onClick={() => setInquiry(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inquiry.trim()) {
                  window.location.href = `/ai-analyst?q=${encodeURIComponent(inquiry)}`;
                }
              }}
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Why did revenue fall over the last 3 days?"
                value={inquiry}
                onChange={(e) => setInquiry(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
                Investigate
              </button>
            </form>
          </article>
        </div>
      </main>
    </div>
  );
}
