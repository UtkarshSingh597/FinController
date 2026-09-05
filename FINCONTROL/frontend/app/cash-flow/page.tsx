"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { KpiCard } from "../../components/ui/kpi-card";
import { NavSidebar } from "../../components/ui/nav-sidebar";
import { AnalystIcon } from "../../components/ui/icons";
import { FinancialSummary, getFinancialSummary } from "../../lib/api";

export default function CashFlowPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);

  useEffect(() => {
    getFinancialSummary().then(setSummary);
  }, []);

  return (
    <div className="app-layout">
      <NavSidebar />

      <main className="main-content">
        <header className="page-header">
          <div>
            <div className="eyebrow">LIQUIDITY & TREASURY INTELLIGENCE</div>
            <h1 className="page-title">Cash Flow & Liquidity Position</h1>
            <p className="page-subtitle">
              Tracking net cash realization, operating expense obligations, liquidity buffers, and cash-flow burn rate.
            </p>
          </div>
          <Link
            href="/ai-analyst?q=Analyze+cash+flow+burn+rate+and+liquidity+forecast"
            className="btn btn-primary"
          >
            <AnalystIcon size={13} color="currentColor" />
            <span>Investigate Cash Flow Health</span>
          </Link>
        </header>

        <section className="metrics-grid">
          <KpiCard
            label="Net Cash Realization"
            value={summary ? `$${Number(summary.net_cash_flow).toLocaleString()}` : "$171,400"}
            trend="+$12,900"
            trendDirection="up"
            subtext="after expenses & refunds"
          />
          <KpiCard
            label="Gross Inflows"
            value={summary ? `$${Number(summary.revenue).toLocaleString()}` : "$284,820"}
            subtext="paid order volume"
          />
          <KpiCard
            label="Operating Expenses"
            value={summary ? `$${Number(summary.expenses).toLocaleString()}` : "$99,220"}
            subtext="payroll, hosting, gateway fees"
          />
          <KpiCard
            label="Liquidity Runway"
            value="14.2 Months"
            trend="Stable"
            trendDirection="up"
          />
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">LIQUIDITY LEDGER</div>
              <h3 className="panel-title">Inflow vs Outflow Financial Statement</h3>
            </div>
            <Badge type="fact">FACT</Badge>
          </div>

          <div className="table-container">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Impact on Cash</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Customer Payment Inflows</td>
                  <td>Operating Inflow</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--semantic-positive-text)" }}>
                    +${summary ? Number(summary.revenue).toLocaleString() : "284,820.00"}
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>Positive cash inflow from paid orders</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Refund Disbursements</td>
                  <td>Operating Outflow</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--semantic-critical-text)" }}>
                    -${summary ? Number(summary.refund_amount).toLocaleString() : "14,200.00"}
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>Customer returns & goodwill reversals</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Operational & Infrastructure Expenses</td>
                  <td>Operating Outflow</td>
                  <td style={{ fontFamily: "var(--font-mono)", color: "var(--semantic-critical-text)" }}>
                    -${summary ? Number(summary.expenses).toLocaleString() : "99,220.00"}
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>Hosting, payment fees, operations costs</td>
                </tr>
                <tr style={{ background: "var(--bg-surface-elevated)" }}>
                  <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>Net Operational Cash Flow</td>
                  <td><strong style={{ color: "var(--text-primary)" }}>Net Surplus</strong></td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--semantic-positive-text)" }}>
                    +${summary ? Number(summary.net_cash_flow).toLocaleString() : "171,400.00"}
                  </td>
                  <td><strong style={{ color: "var(--text-primary)" }}>Net liquid addition to corporate treasury</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
