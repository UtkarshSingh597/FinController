"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { KpiCard } from "../../components/ui/kpi-card";
import { NavSidebar } from "../../components/ui/nav-sidebar";
import { AnalystIcon } from "../../components/ui/icons";
import { getSettlementsSummary, SettlementItem } from "../../lib/api";

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<SettlementItem[]>([]);

  useEffect(() => {
    getSettlementsSummary().then(setSettlements);
  }, []);

  const totalPending = settlements
    .filter((s) => s.status === "pending" || s.status === "delayed")
    .reduce((sum, s) => sum + s.expected_amount, 0);

  return (
    <div className="app-layout">
      <NavSidebar />

      <main className="main-content page-enter">
        <header className="page-header">
          <div>
            <div className="eyebrow">TREASURY & RECONCILIATION</div>
            <h1 className="page-title">Settlement Health & Reconciliation</h1>
            <p className="page-subtitle">
              Reconciling gateway payment records against bank settlements, detecting delayed transit and fee discrepancies.
            </p>
          </div>
          <Link
            href="/ai-analyst?q=Why+is+there+a+settlement+delay+with+demo-pay"
            className="btn btn-primary"
          >
            <AnalystIcon size={13} color="currentColor" />
            <span>Investigate Settlement Delays</span>
          </Link>
        </header>

        <section className="metrics-grid">
          <KpiCard
            label="In-Transit Settlement"
            value={`$${totalPending.toLocaleString()}`}
            subtext="pending batches"
          />
          <KpiCard
            label="Reconciliation Status"
            value="100% Matched"
            trend="0 unmapped payments"
            trendDirection="up"
          />
          <KpiCard
            label="Average Transit Time"
            value="1.8 Days"
            subtext="T+2 payout schedule"
          />
          <KpiCard
            label="Active Providers"
            value="demo-pay"
            subtext="Card processor"
          />
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">SETTLEMENT BATCHES</div>
              <h3 className="panel-title">Provider Settlement Ledger</h3>
            </div>
            <Badge type="fact">FACT</Badge>
          </div>

          <div className="table-container">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Provider</th>
                  <th>Expected Amount</th>
                  <th>Actual Settled</th>
                  <th>Status</th>
                  <th>Expected Date</th>
                  <th>Settled Date</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>{s.id}</td>
                    <td style={{ fontWeight: 600 }}>{s.provider}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)" }}>
                      ${s.expected_amount.toLocaleString()}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", color: s.actual_amount ? "var(--text-primary)" : "var(--text-muted)" }}>
                      {s.actual_amount ? `$${s.actual_amount.toLocaleString()}` : "Pending"}
                    </td>
                    <td>
                      <Badge
                        type={
                          s.status === "paid"
                            ? "fact"
                            : s.status === "delayed"
                            ? "critical"
                            : "moderate"
                        }
                      >
                        {s.status}
                      </Badge>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                      {new Date(s.expected_at).toLocaleDateString()}
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                      {s.settled_at ? new Date(s.settled_at).toLocaleDateString() : "—"}
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
