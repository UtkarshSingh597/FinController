"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { KpiCard } from "../../components/ui/kpi-card";
import { NavSidebar } from "../../components/ui/nav-sidebar";
import { ArrowRightIcon, CheckIcon } from "../../components/ui/icons";
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
      body: "demo-pay card gateway timeout error rate reached 38% (threshold: 5%). Estimated uncaptured volume: $14,200.",
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
            <CheckIcon size={12} color="currentColor" />
            <span>Mark All Read</span>
          </button>
        </header>

        <section className="metrics-grid">
          <KpiCard
            label="Active Unread Alerts"
            value={unreadCount.toString()}
            trend={criticalCount > 0 ? "Requires Review" : "Nominal"}
            trendDirection={criticalCount > 0 ? "down" : "neutral"}
          />
          <KpiCard label="Critical Severity" value={criticalCount.toString()} subtext="clearing & conversion risk" />
          <KpiCard label="High Risk Alerts" value={highCount.toString()} subtext="ML anomaly signals" />
          <KpiCard label="Surveillance Engine" value="Active" subtext="continuous ledger monitoring" />
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">NOTIFICATION FEED</div>
              <h3 className="panel-title">System Alert Stream</h3>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: "14px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-default)",
                  background:
                    alert.status === "resolved"
                      ? "var(--bg-surface-subtle)"
                      : alert.status === "read"
                      ? "var(--bg-surface)"
                      : "var(--bg-surface-elevated)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <Badge type={alert.severity as any}>{alert.severity}</Badge>
                    <span
                      style={{
                        fontSize: "10.5px",
                        padding: "1px 6px",
                        borderRadius: "var(--radius-xs)",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {alert.status}
                    </span>
                    <strong style={{ fontSize: "13.5px", color: "var(--text-primary)" }}>{alert.title}</strong>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "auto", fontFamily: "var(--font-mono)" }}>
                      {alert.timestamp}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5" }}>
                    {alert.body}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "6px", flexShrink: 0, alignItems: "center" }}>
                  {alert.status === "unread" && (
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: "12px", padding: "4px 8px" }}
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== "resolved" && (
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: "12px", padding: "4px 8px" }}
                      onClick={() => handleResolve(alert.id)}
                    >
                      Resolve
                    </button>
                  )}
                  <Link
                    href={`/ai-analyst?q=Investigate+alert+${encodeURIComponent(alert.title)}`}
                    className="btn btn-primary"
                    style={{ fontSize: "12px", padding: "4px 10px" }}
                  >
                    <span>Investigate</span>
                    <ArrowRightIcon size={12} color="currentColor" />
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
