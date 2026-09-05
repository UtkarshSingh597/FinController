"use client";

import React, { useState } from "react";

interface DataPoint {
  date: string;
  amount: number;
}

interface RevenueChartProps {
  data?: DataPoint[];
  baseline?: number;
}

export function RevenueChart({ data, baseline }: RevenueChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const defaultData: DataPoint[] = [
    { date: "Day 1", amount: 7200 },
    { date: "Day 5", amount: 8400 },
    { date: "Day 10", amount: 9100 },
    { date: "Day 15", amount: 8900 },
    { date: "Day 20", amount: 10400 },
    { date: "Day 25", amount: 6200 },
    { date: "Day 28", amount: 5800 },
    { date: "Day 30", amount: 6100 },
  ];

  const points = data && data.length > 0 ? data : defaultData;
  const maxAmount = Math.max(...points.map((p) => p.amount), baseline || 0, 10000);
  const minAmount = 0;
  const chartHeight = 180;
  const chartWidth = 560;

  const getCoordinates = (p: DataPoint, idx: number) => {
    const x = (idx / (points.length - 1)) * chartWidth;
    const y = chartHeight - ((p.amount - minAmount) / (maxAmount - minAmount)) * chartHeight;
    return { x, y };
  };

  const polylinePoints = points
    .map((p, idx) => {
      const { x, y } = getCoordinates(p, idx);
      return `${x},${y}`;
    })
    .join(" ");

  const baselineY =
    baseline != null
      ? chartHeight - ((baseline - minAmount) / (maxAmount - minAmount)) * chartHeight
      : null;

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight + 28}`}
        style={{ width: "100%", height: "auto", overflow: "visible" }}
      >
        {/* Subtle grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chartHeight * (1 - ratio);
          return (
            <line
              key={ratio}
              x1="0"
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke="var(--border-subtle)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          );
        })}

        {/* Baseline reference line */}
        {baselineY !== null && (
          <g>
            <line
              x1="0"
              y1={baselineY}
              x2={chartWidth}
              y2={baselineY}
              stroke="var(--semantic-warning)"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            <text
              x={chartWidth}
              y={baselineY - 5}
              fontSize="10"
              fill="var(--semantic-warning-text)"
              textAnchor="end"
              fontWeight="500"
              fontFamily="var(--font-mono)"
            >
              Baseline: ${baseline?.toLocaleString()}
            </text>
          </g>
        )}

        {/* Trend line */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="var(--text-secondary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, idx) => {
          const { x, y } = getCoordinates(p, idx);
          const isHovered = hoverIndex === idx;
          return (
            <g key={idx}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 4.5 : 3}
                fill={isHovered ? "var(--text-primary)" : "var(--bg-surface)"}
                stroke={isHovered ? "var(--text-primary)" : "var(--border-strong)"}
                strokeWidth="1.5"
                style={{ cursor: "pointer", transition: "all 0.1s ease" }}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            </g>
          );
        })}

        {/* X Axis Labels */}
        {points
          .filter((_, idx) => idx === 0 || idx === Math.floor(points.length / 2) || idx === points.length - 1)
          .map((p, idx) => {
            const originalIndex =
              idx === 0
                ? 0
                : idx === 1
                ? Math.floor(points.length / 2)
                : points.length - 1;
            const { x } = getCoordinates(p, originalIndex);
            return (
              <text
                key={idx}
                x={x}
                y={chartHeight + 18}
                fontSize="10.5"
                fill="var(--text-muted)"
                fontWeight="500"
                textAnchor={idx === 0 ? "start" : idx === 1 ? "middle" : "end"}
                fontFamily="var(--font-mono)"
              >
                {p.date}
              </text>
            );
          })}
      </svg>

      {hoverIndex !== null && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "var(--bg-surface-elevated)",
            color: "var(--text-primary)",
            padding: "4px 8px",
            borderRadius: "var(--radius-xs)",
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            border: "1px solid var(--border-strong)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>{points[hoverIndex].date}:</span>
          <span style={{ fontWeight: 600 }}>${points[hoverIndex].amount.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
