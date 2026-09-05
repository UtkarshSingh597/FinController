"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { RevenueChart } from "../../components/charts/revenue-chart";
import { Badge } from "../../components/ui/badge";
import { KpiCard } from "../../components/ui/kpi-card";
import { NavSidebar } from "../../components/ui/nav-sidebar";
import { AnalystIcon } from "../../components/ui/icons";
import {
  FinancialSummary,
  getFinancialSummary,
  getRevenueTrajectory,
  RevenueDataPoint,
} from "../../lib/api";

export default function RevenuePage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [trajectory, setTrajectory] = useState<RevenueDataPoint[]>([]);

  useEffect(() => {
    getFinancialSummary().then(setSummary);
    getRevenueTrajectory().then(setTrajectory);
  }, []);

  return (
    <div className="app-layout">
      <NavSidebar />

      <main className="main-content page-enter">
        <header className="page-header">
          <div>
            <div className="eyebrow">FINANCIAL REVENUE INTELLIGENCE</div>
            <h1 className="page-title">Revenue Trajectory & Decomposition</h1>
            <p className="page-subtitle">
              Deterministic revenue decomposition, order volumes, average order value (AOV), and leakage indicators.
            </p>
          </div>
          <Link
            href="/ai-analyst?q=Why+did+revenue+change+over+the+last+30+days"
            className="btn btn-primary"
          >
            <AnalystIcon size={13} color="currentColor" />
            <span>Investigate Revenue Shifts</span>
          </Link>
        </header>

        {/* Revenue KPIs */}
        <section className="metrics-grid">
          <KpiCard
            label="Gross Recognized Revenue"
            value={summary ? `$${Number(summary.revenue).toLocaleString()}` : "$284,820"}
            trend="+8.4%"
            trendDirection="up"
            subtext="period total"
          />
          <KpiCard
            label="Paid Orders"
            value={summary ? summary.order_count.toString() : "284"}
            trend="+12 orders"
            trendDirection="up"
          />
          <KpiCard
            label="Average Order Value"
            value={summary ? `$${Number(summary.average_order_value).toFixed(2)}` : "$1,002.88"}
            subtext="mean basket size"
          />
          <KpiCard
            label="Refund Deductions"
            value={summary ? `$${Number(summary.refund_amount).toLocaleString()}` : "$14,200"}
            trend="-4.9% of gross"
            trendDirection="neutral"
          />
        </section>

        {/* Chart Panel */}
        <section className="panel" style={{ marginBottom: "20px" }}>
          <div className="panel-header">
            <div>
              <div className="eyebrow">REVENUE FLOW</div>
              <h3 className="panel-title">30-Day Daily Trajectory vs Baseline Expectation</h3>
            </div>
            <Badge type="fact">FACT</Badge>
          </div>
          <RevenueChart data={trajectory} baseline={8500} />
        </section>

        {/* Revenue Decomposition Drivers */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">DECOMPOSITION ANALYSIS</div>
              <h3 className="panel-title">Primary Revenue Drivers & Leakage Verification</h3>
            </div>
            <Badge type="fact">RECONCILED</Badge>
          </div>

          <div className="table-container">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Financial Component</th>
                  <th>Amount</th>
                  <th>Share of Volume</th>
                  <th>Status</th>
                  <th>Operational Assessment</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Card Checkout Inflows</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>$242,100.00</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>85.0%</td>
                  <td>
                    <Badge type="fact">Active</Badge>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    Primary channel; impacted by 38 timeout decline events
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Alternative Payment Methods</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>$42,720.00</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>15.0%</td>
                  <td>
                    <Badge type="fact">Active</Badge>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>99.2% success rate, nominal</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Issued Refunds</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--semantic-critical-text)" }}>-$14,200.00</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>-4.9%</td>
                  <td>
                    <Badge type="moderate">Elevated</Badge>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    Within standard operational return policy tolerances
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Net Settled Realization</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--semantic-positive-text)" }}>
                    $270,620.00
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>95.1%</td>
                  <td>
                    <Badge type="fact">Settling</Badge>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    $38,420 currently in transit
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
