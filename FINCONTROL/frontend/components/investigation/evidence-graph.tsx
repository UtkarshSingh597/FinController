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
    switch (type.toLowerCase()) {
      case "question":
        return { bg: "var(--bg-surface-elevated)", border: "var(--border-default)", text: "var(--text-primary)" };
      case "skill":
        return { bg: "var(--bg-surface-subtle)", border: "var(--border-default)", text: "var(--text-secondary)" };
      case "fact":
        return { bg: "var(--semantic-positive-bg)", border: "var(--semantic-positive-border)", text: "var(--semantic-positive-text)" };
      case "prediction":
        return { bg: "var(--semantic-info-bg)", border: "var(--semantic-info-border)", text: "var(--semantic-info-text)" };
      case "hypothesis":
        return { bg: "var(--semantic-warning-bg)", border: "var(--semantic-warning-border)", text: "var(--semantic-warning-text)" };
      case "action":
        return { bg: "var(--bg-surface-elevated)", border: "var(--border-strong)", text: "var(--text-primary)" };
      default:
        return { bg: "var(--bg-surface)", border: "var(--border-subtle)", text: "var(--text-primary)" };
    }
  };

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-sm)",
        padding: "18px",
        marginTop: "16px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--text-muted)", fontSize: "10px" }}>
            CAUSAL REASONING AUDIT TRAIL
          </div>
          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
            Structured Evidence Graph
          </h4>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <Badge type="fact">FACT</Badge>
          <Badge type="prediction">PREDICTION</Badge>
          <Badge type="hypothesis">HYPOTHESIS</Badge>
        </div>
      </div>

      {/* Nodes Hierarchy Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {graph.nodes.map((node, idx) => {
          const colors = getNodeColor(node.type);
          const incomingLinks = graph.links?.filter((l) => l.target === node.id) || [];

          return (
            <div
              key={node.id || idx}
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: "var(--radius-xs)",
                padding: "10px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {incomingLinks.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10.5px", color: "var(--text-muted)" }}>
                  <span style={{ fontFamily: "var(--font-mono)" }}>↳</span>
                  <span style={{ textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                    {incomingLinks.map((l) => l.relation.replace(/_/g, " ")).join(", ")}
                  </span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "12.5px", fontWeight: 500, color: colors.text, lineHeight: 1.4 }}>
                  {node.label}
                </span>

                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    fontFamily: "var(--font-mono)",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    padding: "1px 6px",
                    borderRadius: "var(--radius-xs)",
                    color: "var(--text-muted)",
                    flexShrink: 0,
                  }}
                >
                  {node.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "12px", fontSize: "11px", color: "var(--text-muted)" }}>
        All causal nodes are derived from verified MCP capability contracts and fitted ML models.
      </div>
    </div>
  );
}
