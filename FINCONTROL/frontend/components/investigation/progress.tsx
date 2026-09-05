"use client";

import React from "react";
import { Badge } from "../ui/badge";

export type InvestigationStepKey =
  | "routing"
  | "evidence"
  | "anomalies"
  | "synthesis"
  | "conclusion";

interface StepConfig {
  key: InvestigationStepKey;
  label: string;
  subtext: string;
  skillTag?: string;
}

const steps: StepConfig[] = [
  {
    key: "routing",
    label: "Capability Policy Routing",
    subtext: "Parsed inquiry context and mapped to domain investigation policies",
    skillTag: "investigation_orchestrator",
  },
  {
    key: "evidence",
    label: "Ledger Evidence Collection",
    subtext: "Retrieved authoritative financial metrics, transactions & settlement records",
    skillTag: "FACT",
  },
  {
    key: "anomalies",
    label: "Anomaly & Risk Evaluation",
    subtext: "Evaluated Isolation Forest distributions and multi-factor stability models",
    skillTag: "PREDICTION",
  },
  {
    key: "synthesis",
    label: "Hypothesis Synthesis & Verification",
    subtext: "Evaluated causal hypotheses strictly bounded by structured evidence",
    skillTag: "HYPOTHESIS",
  },
  {
    key: "conclusion",
    label: "Audit Report Generation",
    subtext: "Prepared root-cause finding, quantified impact, and operational mitigation",
  },
];

interface InvestigationProgressProps {
  completed: InvestigationStepKey[];
  currentStep?: InvestigationStepKey;
}

export function InvestigationProgress({
  completed,
  currentStep,
}: InvestigationProgressProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
      {steps.map((step) => {
        const isDone = completed.includes(step.key);
        const isActive = currentStep === step.key && !isDone;

        const iconClass = isDone
          ? "step-icon step-done"
          : isActive
          ? "step-icon step-active"
          : "step-icon step-pending";

        return (
          <div
            key={step.key}
            className="investigation-step"
            style={{
              border: isActive
                ? "1px solid var(--border-strong)"
                : isDone
                ? "1px solid var(--border-subtle)"
                : "1px solid transparent",
              background: isActive
                ? "var(--bg-surface-elevated)"
                : isDone
                ? "var(--bg-surface-subtle)"
                : "transparent",
            }}
          >
            <div className={iconClass}>
              {isDone ? "✓" : isActive ? "…" : "○"}
            </div>
            <div style={{ flexGrow: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: "12.5px",
                    color: isDone ? "var(--text-primary)" : isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                >
                  {step.label}
                </span>
                {step.skillTag && (
                  <Badge type={step.skillTag.toLowerCase()}>{step.skillTag}</Badge>
                )}
              </div>
              <div style={{ fontSize: "11.5px", color: isDone ? "var(--text-secondary)" : "var(--text-muted)", marginTop: "2px" }}>
                {step.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
