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
    label: "Skill Policy Routing",
    subtext: "Orchestrator mapped question to specialized skills",
    skillTag: "investigation_orchestrator",
  },
  {
    key: "evidence",
    label: "Authoritative Evidence Collection",
    subtext: "Queried financial summaries, orders, payments & settlements",
    skillTag: "FACT",
  },
  {
    key: "anomalies",
    label: "ML Anomaly & Risk Evaluation",
    subtext: "Isolation Forest scored payment amount & latency anomalies",
    skillTag: "PREDICTION",
  },
  {
    key: "synthesis",
    label: "Controlled Synthesis & Verification",
    subtext: "Ollama reasoning model evaluated hypotheses against facts",
    skillTag: "HYPOTHESIS",
  },
  {
    key: "conclusion",
    label: "Auditable Investigation Published",
    subtext: "Root cause, financial impact & recommended action prepared",
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
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
      {steps.map((step) => {
        const isDone = completed.includes(step.key);
        const isActive = currentStep === step.key && !isDone;

        const iconClass = isDone
          ? "step-icon step-done"
          : isActive
          ? "step-icon step-active"
          : "step-icon step-pending";

        return (
          <div key={step.key} className="investigation-step">
            <div className={iconClass}>
              {isDone ? "✓" : isActive ? "⋯" : "○"}
            </div>
            <div style={{ flexGrow: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: "13px",
                    color: isDone ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                >
                  {step.label}
                </span>
                {step.skillTag && (
                  <Badge type={step.skillTag.toLowerCase()}>{step.skillTag}</Badge>
                )}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                {step.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
