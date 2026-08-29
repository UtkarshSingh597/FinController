"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { KpiCard } from "../../components/ui/kpi-card";
import { NavSidebar } from "../../components/ui/nav-sidebar";
import { getAlerts, markAlertRead, resolveAlert } from "../../lib/api";

interface LocalAlertItem {
  id: string;
  title: string;
  severity: "critical" | "high" | "moderate" | "low" | string;
  body: string;
  timestamp: string;
  status: "unread" | "read" | "resolved";
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<LocalAlertItem[]>([
    {
      id: "alt-01",
      title: "Payment Provider Timeout Spike",
      severity: "critical",
      body: "demo-pay card gateway timeout error rate reached 38% (threshold: 5%). Estimated lost conversion: $14,200.",
      timestamp: "24 mins ago",
      status: "unread",
    },
    {
      id: "alt-02",
      title: "Outlier Payment Amount Flagged",
      severity: "high",
      body: "Isolation Forest model detected abnormal payment amount ($14,850) exceeding 3.5 standard deviations from median basket size.",
      timestamp: "3 hours ago",
      status: "unread",
    },
    {
      id: "alt-03",
      title: "Settlement Batch Transit Delay",
      severity: "moderate",
      body: "Batch settle-03 ($29,800) delayed past expected T+2 transit window.",
      timestamp: "18 hours ago",
      status: "read",
    },
  ]);

  useEffect(() => {
    getAlerts()
      .then((serverAlerts) => {
        if (serverAlerts && serverAlerts.length > 0) {
          setAlerts(
            serverAlerts.map((a) => ({
              id: a.id,
              title: a.title,
              severity: a.severity.toLowerCase(),
              body: a.body,
              timestamp: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: a.read_at ? "read" : "unread",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await markAlertRead(id);
    } catch {}
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "read" } : a))
    );
  };

  const handleResolve = async (id: string) => {
    try {
      await resolveAlert(id);
    } catch {}
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "resolved" } : a))
    );
  };

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, status: "read" })));
  };

  const unreadCount = alerts.filter((a) => a.status === "unread").length;
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const highCount = alerts.filter((a) => a.severity === "high").length;

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
            value={unreadCount.toString()}
            trend={criticalCount > 0 ? "Critical" : "Nominal"}
            trendDirection="down"
          />
          <KpiCard label="Critical Severity" value={criticalCount.toString()} subtext="gateway & clearing risk" />
          <KpiCard label="High Risk Alerts" value={highCount.toString()} subtext="ML outlier anomalies" />
          <KpiCard label="Surveillance Engine" value="Active" subtext="Automated real-time telemetry" />
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
                  border:
                    alert.status === "resolved"
                      ? "1px solid var(--border-subtle)"
                      : alert.status === "read"
                      ? "1px solid rgba(255, 255, 255, 0.1)"
                      : "1px solid rgba(239, 68, 68, 0.3)",
                  background:
                    alert.status === "resolved"
                      ? "rgba(255, 255, 255, 0.01)"
                      : alert.status === "read"
                      ? "rgba(255, 255, 255, 0.03)"
                      : "rgba(239, 68, 68, 0.05)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 6 }}>
                    <Badge type={alert.severity as any}>{alert.severity}</Badge>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background:
                          alert.status === "resolved"
                            ? "rgba(34, 197, 94, 0.15)"
                            : alert.status === "read"
                            ? "rgba(148, 163, 184, 0.15)"
                            : "rgba(239, 68, 68, 0.2)",
                        color:
                          alert.status === "resolved"
                            ? "#4ade80"
                            : alert.status === "read"
                            ? "#94a3b8"
                            : "#f87171",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {alert.status}
                    </span>
                    <strong style={{ fontSize: "14px" }}>{alert.title}</strong>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {alert.timestamp}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5" }}>
                    {alert.body}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  {alert.status === "unread" && (
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: "12px", padding: "6px 10px" }}
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== "resolved" && (
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: "12px", padding: "6px 10px" }}
                      onClick={() => handleResolve(alert.id)}
                    >
                      Resolve
                    </button>
                  )}
                  <Link
                    href={`/ai-analyst?q=Investigate+alert+${encodeURIComponent(alert.title)}`}
                    className="btn btn-primary"
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    Investigate →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
