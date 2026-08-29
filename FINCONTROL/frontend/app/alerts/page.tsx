"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { KpiCard } from "../../components/ui/kpi-card";
import { NavSidebar } from "../../components/ui/nav-sidebar";

interface AlertItem {
  id: string;
  title: string;
  severity: "critical" | "high" | "moderate" | "low";
  body: string;
  timestamp: string;
  read: boolean;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: "alt-01",
      title: "Payment Provider Timeout Spike",
      severity: "critical",
      body: "demo-pay card gateway timeout error rate reached 38% (threshold: 5%). Estimated lost conversion: $14,200.",
      timestamp: "24 mins ago",
      read: false,
    },
    {
      id: "alt-02",
      title: "Outlier Payment Amount Flagged",
      severity: "high",
      body: "Isolation Forest model detected abnormal payment amount ($14,850) exceeding 3.5 standard deviations from median basket size.",
      timestamp: "3 hours ago",
      read: false,
    },
    {
      id: "alt-03",
      title: "Settlement Batch Transit Delay",
      severity: "moderate",
      body: "Batch settle-03 ($29,800) delayed past expected T+2 transit window.",
      timestamp: "18 hours ago",
      read: true,
    },
  ]);

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  return (
    <div className="app-layout">
      <NavSidebar />

      <main className="main-content">
        <header className="page-header">
          <div>
            <div className="eyebrow">FINANCIAL SURVEILLANCE & ALERTS</div>
            <h1 className="page-title">Alerts & System Notifications</h1>
            <p className="page-subtitle">
              Automated threshold monitors, ML risk triggers, and operational webhook alarms.
            </p>
          </div>
          <button className="btn btn-secondary" onClick={markAllRead}>
            Mark All Read
          </button>
        </header>

        <section className="metrics-grid">
          <KpiCard
            label="Active Unread Alerts"
            value={alerts.filter((a) => !a.read).length.toString()}
            trend={alerts.some((a) => !a.read && a.severity === "critical") ? "Critical" : "Normal"}
            trendDirection="down"
          />
          <KpiCard label="Critical Severity" value="1" subtext="gateway degradation" />
          <KpiCard label="High Risk" value="1" subtext="ML outlier" />
          <KpiCard label="Monitoring Status" value="Online" subtext="100% telemetry healthy" />
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">ACTIVE NOTIFICATION FEED</div>
              <h3 className="panel-title">System Alert Stream</h3>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: "16px 20px",
                  borderRadius: 8,
                  border: alert.read ? "1px solid var(--border-subtle)" : "1px solid #cbd5ce",
                  background: alert.read ? "#ffffff" : "#fbfdfb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 6 }}>
                    <Badge type={alert.severity}>{alert.severity}</Badge>
                    <strong style={{ fontSize: "14px" }}>{alert.title}</strong>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {alert.timestamp}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5" }}>
                    {alert.body}
                  </p>
                </div>

                <Link
                  href={`/ai-analyst?q=Investigate+alert+${encodeURIComponent(alert.title)}`}
                  className="btn btn-secondary"
                  style={{ flexShrink: 0, fontSize: "12px", padding: "6px 12px" }}
                >
                  Investigate →
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
