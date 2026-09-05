"use client";

import React from "react";

export function MetricSkeleton() {
  return (
    <div className="metric-card skeleton-card">
      <div className="skeleton-bar" style={{ width: "40%", height: "12px", marginBottom: "10px" }} />
      <div className="skeleton-bar" style={{ width: "65%", height: "26px", marginBottom: "8px" }} />
      <div className="skeleton-bar" style={{ width: "50%", height: "14px" }} />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="panel skeleton-card" style={{ height: "260px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="skeleton-bar" style={{ width: "35%", height: "16px" }} />
        <div className="skeleton-bar" style={{ width: "15%", height: "16px" }} />
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "140px", padding: "10px 0" }}>
        {[40, 65, 50, 80, 60, 95, 45, 70].map((h, i) => (
          <div
            key={i}
            className="skeleton-bar"
            style={{ flex: 1, height: `${h}%`, borderRadius: "var(--radius-xs)" }}
          />
        ))}
      </div>
      <div className="skeleton-bar" style={{ width: "100%", height: "12px" }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="table-container skeleton-card">
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", gap: "16px" }}>
        <div className="skeleton-bar" style={{ width: "20%", height: "12px" }} />
        <div className="skeleton-bar" style={{ width: "30%", height: "12px" }} />
        <div className="skeleton-bar" style={{ width: "20%", height: "12px" }} />
        <div className="skeleton-bar" style={{ width: "15%", height: "12px", marginLeft: "auto" }} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: "14px 16px",
            borderBottom: i < rows - 1 ? "1px solid var(--border-subtle)" : "none",
            display: "flex",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <div className="skeleton-bar" style={{ width: "18%", height: "14px" }} />
          <div className="skeleton-bar" style={{ width: "35%", height: "14px" }} />
          <div className="skeleton-bar" style={{ width: "15%", height: "14px" }} />
          <div className="skeleton-bar" style={{ width: "12%", height: "14px", marginLeft: "auto" }} />
        </div>
      ))}
    </div>
  );
}

export function InvestigationSkeleton() {
  return (
    <div className="panel skeleton-card">
      <div className="skeleton-bar" style={{ width: "30%", height: "16px", marginBottom: "16px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div className="skeleton-bar" style={{ width: "22px", height: "22px", borderRadius: "var(--radius-xs)" }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton-bar" style={{ width: "45%", height: "13px", marginBottom: "4px" }} />
              <div className="skeleton-bar" style={{ width: "70%", height: "11px" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
