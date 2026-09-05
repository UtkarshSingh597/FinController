"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BreakdownChart } from "../../components/charts/breakdown-chart";
import { Badge } from "../../components/ui/badge";
import { KpiCard } from "../../components/ui/kpi-card";
import { NavSidebar } from "../../components/ui/nav-sidebar";
import { AnalystIcon } from "../../components/ui/icons";
import { getPaymentBreakdown, PaymentBreakdown } from "../../lib/api";

export default function PaymentsPage() {
  const [data, setData] = useState<PaymentBreakdown | null>(null);

  useEffect(() => {
    getPaymentBreakdown().then(setData);
  }, []);

  const failureItems = data
    ? Object.entries(data.failure_reasons).map(([reason, count]) => ({
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

      <main className="main-content page-enter">
        <header className="page-header">
          <div>
            <div className="eyebrow">PAYMENT GATEWAY INTELLIGENCE</div>
            <h1 className="page-title">Payment Reliability & Decline Health</h1>
            <p className="page-subtitle">
              Granular transaction reliability monitoring, gateway latency tracking, and root-cause failure breakdown.
            </p>
          </div>
          <Link
            href="/ai-analyst?q=Why+are+payments+failing+due+to+provider+timeouts"
            className="btn btn-primary"
          >
            <AnalystIcon size={13} color="currentColor" />
            <span>Investigate Payment Failures</span>
          </Link>
        </header>

        <section className="metrics-grid">
          <KpiCard
            label="Total Payment Attempts"
            value={data ? data.total_payments.toString() : "360"}
            subtext="last 30 days"
          />
          <KpiCard
            label="Successful Conversions"
            value={data ? data.succeeded.toString() : "312"}
            trend={data ? `${(data.success_rate * 100).toFixed(1)}%` : "86.7%"}
            trendDirection="up"
          />
          <KpiCard
            label="Failed Transactions"
            value={data ? data.failed.toString() : "48"}
            trend="Failure spike"
            trendDirection="down"
          />
          <KpiCard
            label="Refund Events"
            value={data ? data.refunded.toString() : "14"}
            subtext="3.9% return rate"
          />
        </section>

        <div className="grid-2col">
          {/* Failure Reasons Breakdown */}
          <article className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">FAILURE ATTRIBUTION</div>
                <h3 className="panel-title">Primary Decline Reasons</h3>
              </div>
              <Badge type="fact">LOG EVIDENCE</Badge>
            </div>
            <BreakdownChart items={failureItems} />
          </article>

          {/* Gateway Health Indicator */}
          <article className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">GATEWAY CONNECTORS</div>
                <h3 className="panel-title">Provider Availability</h3>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  background: "var(--semantic-critical-bg)",
                  border: "1px solid var(--semantic-critical-border)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <div>
                  <strong style={{ color: "var(--text-primary)" }}>demo-pay (Cards)</strong>
                  <div style={{ fontSize: "11px", color: "var(--semantic-critical-text)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                    Latency: 12,400ms · 38 timeouts
                  </div>
                </div>
                <Badge type="critical">DEGRADED</Badge>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  background: "var(--bg-surface-elevated)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <div>
                  <strong style={{ color: "var(--text-primary)" }}>bank-direct (ACH)</strong>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                    Latency: 420ms · 0 timeouts
                  </div>
                </div>
                <Badge type="fact">OPERATIONAL</Badge>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
