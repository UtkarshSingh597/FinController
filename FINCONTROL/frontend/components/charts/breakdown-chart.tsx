"use client";

import React from "react";

interface CategoryItem {
  label: string;
  count: number;
  color?: string;
}

interface BreakdownChartProps {
  title?: string;
  items: CategoryItem[];
}

export function BreakdownChart({ title, items }: BreakdownChartProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  const defaultColors = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6"];

  return (
    <div style={{ width: "100%" }}>
      {title && (
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
          {title}
        </div>
      )}

      {/* Stacked bar */}
      <div
        style={{
          display: "flex",
          height: 12,
          borderRadius: 4,
          overflow: "hidden",
          backgroundColor: "#e2e8e4",
          marginBottom: 14,
        }}
      >
        {items.map((item, idx) => {
          const widthPercent = total > 0 ? (item.count / total) * 100 : 0;
          if (widthPercent === 0) return null;
          return (
            <div
              key={idx}
              style={{
                width: `${widthPercent}%`,
                backgroundColor: item.color || defaultColors[idx % defaultColors.length],
                transition: "width 0.3s ease",
              }}
              title={`${item.label}: ${item.count} (${widthPercent.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {items.map((item, idx) => {
          const widthPercent = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
          const color = item.color || defaultColors[idx % defaultColors.length];
          return (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "12px" }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: color,
                  display: "inline-block",
                }}
              />
              <span style={{ color: "var(--text-secondary)" }}>{item.label}:</span>
              <strong style={{ marginLeft: "auto", fontFamily: "var(--font-mono)" }}>
                {item.count} ({widthPercent}%)
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
