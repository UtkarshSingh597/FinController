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
  const chartWidth = 540;

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

  const areaPoints = `0,${chartHeight} ${polylinePoints} ${chartWidth},${chartHeight}`;

  const baselineY =
    baseline != null
      ? chartHeight - ((baseline - minAmount) / (maxAmount - minAmount)) * chartHeight
      : null;

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
        style={{ width: "100%", height: "auto", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chartHeight * (1 - ratio);
          return (
            <line
              key={ratio}
              x1="0"
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke="#e5ebe7"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Baseline reference line */}
        {baselineY !== null && (
          <line
            x1="0"
            y1={baselineY}
            x2={chartWidth}
            y2={baselineY}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="6 3"
          />
        )}

        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#chartGradient)" />

        {/* Trend line */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
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
                r={isHovered ? 5 : 3.5}
                fill={isHovered ? "#b7f26a" : "#123d32"}
                stroke="#ffffff"
                strokeWidth="2"
                style={{ cursor: "pointer", transition: "all 0.15s ease" }}
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
                y={chartHeight + 20}
                fontSize="11"
                fill="#889993"
                textAnchor={idx === 0 ? "start" : idx === 1 ? "middle" : "end"}
                fontFamily="var(--font-sans)"
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
            background: "#0b1714",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: "12px",
            fontFamily: "var(--font-mono)",
            border: "1px solid #1a332d",
          }}
        >
          {points[hoverIndex].date}: ${points[hoverIndex].amount.toLocaleString()}
        </div>
      )}
    </div>
  );
}
