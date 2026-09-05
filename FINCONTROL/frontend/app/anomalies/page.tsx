"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { KpiCard } from "../../components/ui/kpi-card";
import { NavSidebar } from "../../components/ui/nav-sidebar";
import { AnalystIcon, ArrowRightIcon } from "../../components/ui/icons";
import { AnomalyItem, getAnomalies } from "../../lib/api";

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);

  useEffect(() => {
    getAnomalies().then(setAnomalies);
  }, []);

  const criticalCount = anomalies.filter((a) => a.severity.toLowerCase() === "critical").length;
  const highCount = anomalies.filter((a) => a.severity.toLowerCase() === "high").length;

  return (
    <div className="app-layout">
      <NavSidebar />

      <main className="main-content">
        <header className="page-header">
          <div>
            <div className="eyebrow">MACHINE LEARNING SURVEILLANCE</div>
            <h1 className="page-title">Anomaly Detection Center</h1>
            <p className="page-subtitle">
              Unsupervised Isolation Forest models flagging outlier transaction amounts, latency spikes, and reconciliation drifts.
            </p>
          </div>
          <Link
            href="/ai-analyst?q=Analyze+all+detected+critical+and+high+anomalies"
            className="btn btn-primary"
          >
            <AnalystIcon size={13} color="currentColor" />
            <span>Investigate All Outliers</span>
          </Link>
        </header>

        {/* Top Anomaly KPIs */}
        <section className="metrics-grid">
          <KpiCard
            label="Total Active Anomalies"
            value={anomalies.length.toString()}
            subtext="last 30 days"
          />
          <KpiCard
            label="Critical Outliers"
            value={criticalCount.toString()}
            trend={criticalCount > 0 ? "Requires Review" : "Nominal"}
            trendDirection={criticalCount > 0 ? "down" : "neutral"}
          />
          <KpiCard
            label="High Severity"
            value={highCount.toString()}
            subtext="elevated risk"
          />
          <KpiCard
            label="ML Model"
            value="Isolation Forest"
            subtext="v1.0 (200 estimators)"
          />
        </section>

        {/* Anomalies Table */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">OUTLIER RECORDS</div>
              <h3 className="panel-title">Detected Financial Anomalies</h3>
            </div>
            <Badge type="prediction">PREDICTION</Badge>
          </div>

          <div className="table-container">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Entity Type</th>
                  <th>Entity ID</th>
                  <th>Severity</th>
                  <th>Anomaly Score</th>
                  <th>Explanation Features</th>
                  <th>Detected At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((anom) => (
                  <tr key={anom.id}>
                    <td style={{ textTransform: "capitalize", fontWeight: 600 }}>
                      {anom.entity_type}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {anom.entity_id || "N/A"}
                    </td>
                    <td>
                      <Badge type={anom.severity}>{anom.severity}</Badge>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                      {Number(anom.anomaly_score).toFixed(4)}
                    </td>
                    <td>
                      <pre
                        style={{
                          margin: 0,
                          fontSize: "11px",
                          fontFamily: "var(--font-mono)",
                          background: "var(--bg-surface-elevated)",
                          color: "var(--text-secondary)",
                          padding: "3px 6px",
                          borderRadius: "var(--radius-xs)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {JSON.stringify(anom.explanation_features)}
                      </pre>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                      {new Date(anom.detected_at).toLocaleString()}
                    </td>
                    <td>
                      <Link
                        href={`/ai-analyst?q=Why+is+${anom.entity_type}+${anom.entity_id || ""}+flagged+as+${anom.severity}+anomaly`}
                        className="btn btn-secondary"
                        style={{ padding: "3px 8px", fontSize: "11px" }}
                      >
                        <span>Investigate</span>
                        <ArrowRightIcon size={11} color="currentColor" />
                      </Link>
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
