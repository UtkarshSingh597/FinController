"use client";

import React from "react";
import { Badge } from "../ui/badge";
import { EvidenceGraph } from "../../lib/api/types";

interface EvidenceGraphProps {
  graph?: EvidenceGraph | null;
}

export function EvidenceGraphViewer({ graph }: EvidenceGraphProps) {
  if (!graph || !graph.nodes || graph.nodes.length === 0) {
    return null;
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case "question":
        return { bg: "#f3f4f6", border: "#d1d5db", text: "#111827" };
      case "skill":
        return { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" };
      case "fact":
        return { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" };
      case "prediction":
        return { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8" };
      case "hypothesis":
        return { bg: "#fffbeb", border: "#fde68a", text: "#b45309" };
      case "action":
        return { bg: "#fdf2f8", border: "#fbcfe8", text: "#9d174d" };
      default:
        return { bg: "#ffffff", border: "var(--border-subtle)", text: "inherit" };
    }
  };

  return (
    <div
      style={{
        background: "#fafafa",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        padding: "20px",
        marginTop: "16px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--text-muted)", fontSize: "10px" }}>
            CAUSAL REASONING AUDIT TRAIL
          </div>
          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>Structured Evidence Graph</h4>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <Badge type="fact">FACTS</Badge>
          <Badge type="prediction">ML PREDICTIONS</Badge>
          <Badge type="hypothesis">HYPOTHESIS</Badge>
        </div>
      </div>

      {/* Nodes Hierarchy Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {graph.nodes.map((node) => {
          const colors = getNodeColor(node.type);
          const incomingLinks = graph.links?.filter((l) => l.target === node.id) || [];

          return (
            <div
              key={node.id}
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: 6,
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {incomingLinks.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-muted)" }}>
                  <span>↳</span>
                  <span style={{ textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                    {incomingLinks.map((l) => l.relation.replace("_", " ")).join(", ")}
                  </span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: colors.text }}>
                  {node.label}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontFamily: "var(--font-mono)",
                    background: "rgba(0,0,0,0.04)",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  {node.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "14px", fontSize: "11px", color: "var(--text-muted)" }}>
        * Deterministic derivation: All nodes are generated from verified MCP data points and Isolation Forest inferences.
      </div>
    </div>
  );
}
