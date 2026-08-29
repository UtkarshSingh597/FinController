"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BreakdownChart } from "../../components/charts/breakdown-chart";
import { Badge } from "../../components/ui/badge";
import { KpiCard } from "../../components/ui/kpi-card";
import { NavSidebar } from "../../components/ui/nav-sidebar";
import { getPaymentBreakdown, PaymentBreakdown } from "../../lib/api";

export default function PaymentsPage() {
  const [data, setData] = useState<PaymentBreakdown | null>(null);

  useEffect(() => {
    getPaymentBreakdown().then(setData);
  }, []);

  const failureItems = data
    ? Object.entries(data.failure_reasons).map(([reason, count]) => ({
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
            <div className="eyebrow">PAYMENT GATEWAY INTELLIGENCE</div>
            <h1 className="page-title">Payment Performance & Decline Health</h1>
            <p className="page-subtitle">
              Granular transaction reliability monitoring, gateway latency tracking, and root-cause failure breakdown.
            </p>
          </div>
          <Link
            href="/ai-analyst?q=Why+are+payments+failing+due+to+provider+timeouts"
            className="btn btn-primary"
          >
            ✦ Investigate Payment Failures
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
            trend="Spike on day 27"
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

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px",
                  background: "#fee2e2",
                  borderRadius: 6,
                }}
              >
                <div>
                  <strong>demo-pay (Cards)</strong>
                  <div style={{ fontSize: "11px", color: "#991b1b" }}>
                    Latency: 12,400ms · 38 timeouts
                  </div>
                </div>
                <Badge type="critical">DEGRADED</Badge>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px",
                  background: "#f0fdf4",
                  borderRadius: 6,
                }}
              >
                <div>
                  <strong>bank-direct (ACH)</strong>
                  <div style={{ fontSize: "11px", color: "#166534" }}>
                    Latency: 420ms · 0 timeouts
                  </div>
                </div>
                <Badge type="low">HEALTHY</Badge>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
