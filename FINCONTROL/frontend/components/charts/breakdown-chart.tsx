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

  const defaultColors = ["#f87171", "#fbbf24", "#60a5fa", "#9cb1a8", "#677d74"];

  return (
    <div style={{ width: "100%" }}>
      {title && (
        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>
          {title}
        </div>
      )}

      {/* Segmented bar */}
      <div
        style={{
          display: "flex",
          height: 8,
          borderRadius: "var(--radius-xs)",
          overflow: "hidden",
          backgroundColor: "var(--bg-surface-elevated)",
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
                transition: "width 0.2s ease",
              }}
              title={`${item.label}: ${item.count} (${widthPercent.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Structured data rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {items.map((item, idx) => {
          const widthPercent = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
          const color = item.color || defaultColors[idx % defaultColors.length];
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "12px",
                padding: "4px 6px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "1px",
                  backgroundColor: color,
                  display: "inline-block",
                }}
              />
              <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>
                {item.label}
              </span>
              <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "11.5px", color: "var(--text-primary)" }}>
                {item.count} <span style={{ color: "var(--text-muted)" }}>({widthPercent}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
