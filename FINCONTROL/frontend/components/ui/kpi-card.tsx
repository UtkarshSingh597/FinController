import React from "react";
import { TrendUpIcon, TrendDownIcon } from "./icons";

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
          {trend && (
            <span className={`trend-pill ${trendClass}`}>
              {trendDirection === "up" ? (
                <TrendUpIcon size={12} color="currentColor" />
              ) : trendDirection === "down" ? (
                <TrendDownIcon size={12} color="currentColor" />
              ) : null}
              {trend}
            </span>
          )}
          {subtext && <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>{subtext}</span>}
        </div>
      )}
    </article>
  );
}
