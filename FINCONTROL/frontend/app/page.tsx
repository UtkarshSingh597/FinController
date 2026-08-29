"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BreakdownChart } from "../components/charts/breakdown-chart";
import { RevenueChart } from "../components/charts/revenue-chart";
import { Badge } from "../components/ui/badge";
import { KpiCard } from "../components/ui/kpi-card";
import { NavSidebar } from "../components/ui/nav-sidebar";
import {
  FinancialSummary,
  getFinancialSummary,
  getPaymentBreakdown,
  getRevenueTrajectory,
  PaymentBreakdown,
  RevenueDataPoint,
} from "../lib/api";

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
        label: reason.replace("_", " "),
        count,
      }))
    : [
        { label: "provider timeout", count: 38, color: "#ef4444" },
        { label: "insufficient funds", count: 6, color: "#f59e0b" },
        { label: "card declined", count: 4, color: "#64748b" },
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
              Continuous multi-tenant financial monitoring, ML anomaly detection, and policy-driven AI investigations.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/scenarios" className="btn btn-secondary">
              ⚡ Run Scenario
            </Link>
            <Link href="/ai-analyst" className="btn btn-primary">
              ✦ New Investigation
            </Link>
          </div>
        </header>

        {/* Top KPIs */}
        <section className="metrics-grid">
          <KpiCard
            label="Gross Revenue (30d)"
            value={summary ? `$${Number(summary.revenue).toLocaleString()}` : "$284,820"}
            trend="+8.4%"
            trendDirection="up"
            subtext="vs prev period"
          />
          <KpiCard
            label="Payment Success Rate"
            value={
              summary
                ? `${(Number(summary.payment_success_rate) * 100).toFixed(1)}%`
                : "96.8%"
            }
            trend="-3.2pp"
            trendDirection="down"
            subtext="recent failure spike"
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
            subtext="liquid position"
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

        {/* Main Intelligence Grid */}
        <div className="grid-2col">
          {/* Revenue Chart Panel */}
          <article className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">REVENUE TRAJECTORY</div>
                <h3 className="panel-title">30-Day Daily Inflow vs Baseline</h3>
              </div>
              <Badge type="fact">DETERMINISTIC FACT</Badge>
            </div>
            <RevenueChart data={trajectory} baseline={8500} />
          </article>

          {/* AI Signal Alert Card */}
          <article
            className="panel"
            style={{
              backgroundColor: "#10201d",
              color: "#e8f0e9",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="eyebrow" style={{ color: "var(--accent-lime)" }}>
                  CRITICAL AI SIGNAL
                </span>
                <Badge type="critical">CRITICAL</Badge>
              </div>
              <h3 style={{ fontSize: "18px", margin: "10px 0 8px", color: "#fff" }}>
                Payment Failure Spike Detected
              </h3>
              <p style={{ color: "#c2d4cd", fontSize: "13px", lineHeight: "1.6" }}>
                Provider timeout failures surged to <strong>38%</strong> over the last 3 days, causing an estimated revenue leakage of <strong>$14,200</strong>.
              </p>
            </div>
            <div style={{ marginTop: "20px" }}>
              <Link
                href="/ai-analyst?q=Why+did+revenue+fall+due+to+payment+failures"
                className="btn btn-accent"
                style={{ width: "100%" }}
              >
                Launch Multi-Skill Investigation →
              </Link>
            </div>
          </article>
        </div>

        {/* Secondary Grid */}
        <div className="grid-equal">
          {/* Failure Breakdown */}
          <article className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">PAYMENT HEALTH</div>
                <h3 className="panel-title">Decline & Failure Categorization</h3>
              </div>
              <Badge type="fact">TRANSACTION LOGS</Badge>
            </div>
            <BreakdownChart items={failureItems} />
          </article>

          {/* Quick AI Analyst Bar */}
          <article
            className="panel"
            style={{
              backgroundColor: "#e8f5ec",
              border: "1px solid #c2e6d1",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div className="eyebrow" style={{ color: "#065f46" }}>
                FINANCIAL REASONING AGENT
              </div>
              <h3 className="panel-title" style={{ color: "#064e3b" }}>
                Ask a Financial Intelligence Question
              </h3>
              <p style={{ color: "#047857", fontSize: "13px", margin: "6px 0 16px" }}>
                Backed by 10 specialized skills, deterministic services, and ML anomaly models.
              </p>
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
                placeholder="e.g. Why did revenue decline yesterday?"
                value={inquiry}
                onChange={(e) => setInquiry(e.target.value)}
                style={{ backgroundColor: "#ffffff" }}
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
