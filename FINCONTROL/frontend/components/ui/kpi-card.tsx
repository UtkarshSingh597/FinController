import React from "react";

interface KpiCardProps {
  label: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  subtext?: string;
}

export function KpiCard({
  label,
  value,
  trend,
  trendDirection = "neutral",
  subtext,
}: KpiCardProps) {
  const trendClass =
    trendDirection === "up"
      ? "trend-up"
      : trendDirection === "down"
      ? "trend-down"
      : "trend-neutral";

  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <div className="metric-value">{value}</div>
      {(trend || subtext) && (
        <div className="metric-trend">
          {trend && <span className={trendClass}>{trend}</span>}
          {subtext && <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>{subtext}</span>}
        </div>
      )}
    </article>
  );
}
