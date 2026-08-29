"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  InvestigationProgress,
  InvestigationStepKey,
} from "../../components/investigation/progress";
import { EvidenceGraphViewer } from "../../components/investigation/evidence-graph";
import { Badge } from "../../components/ui/badge";
import { NavSidebar } from "../../components/ui/nav-sidebar";
import { createInvestigation, InvestigationRecord } from "../../lib/api";

function AnalystContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [question, setQuestion] = useState(initialQuery);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<InvestigationStepKey[]>([]);
  const [currentStep, setCurrentStep] = useState<InvestigationStepKey | undefined>(undefined);
  const [result, setResult] = useState<InvestigationRecord | null>(null);

  const sampleQuestions = [
    "Why did revenue fall over the last 3 days?",
    "Why are card payments declining with provider timeouts?",
    "Is there revenue leakage between payments and settlements?",
    "What if refunds increase by 20% next month?",
    "Are there unusual transaction amounts in the recent batch?",
  ];

  const handleStartInvestigation = async (queryToRun?: string) => {
    const targetQ = queryToRun || question;
    if (!targetQ.trim() || isInvestigating) return;

    setIsInvestigating(true);
    setResult(null);
    setCompletedSteps([]);

    // Step 1: Routing
    setCurrentStep("routing");
    await new Promise((r) => setTimeout(r, 600));
    setCompletedSteps(["routing"]);

    // Step 2: Evidence
    setCurrentStep("evidence");
    await new Promise((r) => setTimeout(r, 700));
    setCompletedSteps(["routing", "evidence"]);

    // Step 3: Anomalies & ML
    setCurrentStep("anomalies");
    await new Promise((r) => setTimeout(r, 600));
    setCompletedSteps(["routing", "evidence", "anomalies"]);

    // Step 4: Synthesis
    setCurrentStep("synthesis");
    await new Promise((r) => setTimeout(r, 500));
    setCompletedSteps(["routing", "evidence", "anomalies", "synthesis"]);

    // Execute API Call
    try {
      const invResult = await createInvestigation(targetQ);
      setResult(invResult);
      setCurrentStep("conclusion");
      setCompletedSteps(["routing", "evidence", "anomalies", "synthesis", "conclusion"]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInvestigating(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleStartInvestigation(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="app-layout">
      <NavSidebar />

      <main className="main-content">
        <header className="page-header">
          <div>
            <div className="eyebrow">AI ANALYST / AUTONOMOUS INVESTIGATION WORKSPACE</div>
            <h1 className="page-title">Financial Investigation Engine</h1>
            <p className="page-subtitle">
              Policy-driven multi-skill analysis coordinating deterministic services, ML outlier scoring, and auditable reasoning.
            </p>
          </div>
        </header>

        {/* Question Form */}
        <section className="panel" style={{ marginBottom: "24px" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartInvestigation();
            }}
          >
            <label className="form-label" style={{ fontSize: "14px" }}>
              Submit a Financial Inquiry
            </label>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Why did revenue decline yesterday?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isInvestigating}
                style={{ fontSize: "15px", padding: "12px 16px" }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!question.trim() || isInvestigating}
                style={{ minWidth: "160px" }}
              >
                {isInvestigating ? "Investigating..." : "✦ Start Investigation"}
              </button>
            </div>
          </form>

          {/* Preset queries */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "14px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", alignSelf: "center" }}>
              Try sample inquiry:
            </span>
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuestion(sq);
                  handleStartInvestigation(sq);
                }}
                disabled={isInvestigating}
                style={{
                  background: "#f0f4f1",
                  border: "1px solid #d4dfd8",
                  padding: "4px 10px",
                  borderRadius: 4,
                  fontSize: "12px",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                }}
              >
                {sq}
              </button>
            ))}
          </div>
        </section>

        {/* Live Investigation Progress & Evidence Chain */}
        <div className="grid-2col">
          {/* Progress Tracker */}
          <article className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">EXECUTION PIPELINE</div>
                <h3 className="panel-title">Skill & Tool Execution Chain</h3>
              </div>
              <Badge type={isInvestigating ? "prediction" : "fact"}>
                {isInvestigating ? "RUNNING" : "POLICY AUDIT"}
              </Badge>
            </div>

            <InvestigationProgress completed={completedSteps} currentStep={currentStep} />
          </article>

          {/* Status & Skills Involved */}
          <article className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">AUDITABLE CONTEXT</div>
                <h3 className="panel-title">Orchestration & Bounds</h3>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>
                  ACTIVE TENANT
                </span>
                <strong>Acme FinTech (Verified Principal)</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>
                  SKILL POLICIES APPLIED
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                  {(result?.conclusion?.skills || [
                    "investigation_orchestrator",
                    "revenue_investigation",
                    "payment_analysis",
                  ]).map((s) => (
                    <span
                      key={s}
                      style={{
                        background: "#e8f0ec",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "#163f35",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>
                  REASONING MODEL
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>Qwen3:8b via Ollama Adapter</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>
                  SECURITY BOUNDARY
                </span>
                <span>MCP Read-Only / Zero Direct DB Access</span>
              </div>
            </div>
          </article>
        </div>

        {/* Investigation Conclusion & Evidence Workspace */}
        {result && (
          <section className="panel" style={{ marginTop: "24px", border: "1px solid #b7f26a" }}>
            <div className="panel-header" style={{ borderBottomColor: "#e5f0e8" }}>
              <div>
                <div className="eyebrow" style={{ color: "#065f46" }}>
                  AUDITABLE CONCLUSION
                </div>
                <h2 style={{ fontSize: "20px", color: "var(--text-primary)" }}>
                  Investigation Findings & Recommended Mitigation
                </h2>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <Badge type="hypothesis">HYPOTHESIS</Badge>
                <Badge type="fact">CONFIDENCE: {result.conclusion?.confidence?.toUpperCase() || "HIGH"}</Badge>
              </div>
            </div>

            {/* Synthesized Explanation */}
            <div
              style={{
                backgroundColor: "#f8fdf9",
                borderLeft: "4px solid #10b981",
                padding: "16px 20px",
                borderRadius: "0 8px 8px 0",
                fontSize: "14px",
                lineHeight: "1.7",
                color: "#132d26",
                marginBottom: "20px",
              }}
            >
              {result.conclusion?.text}
            </div>

            {/* Recommended Action */}
            {result.conclusion?.recommended_action && (
              <div
                style={{
                  background: "#10201d",
                  color: "#e2ede8",
                  padding: "16px 20px",
                  borderRadius: "8px",
                  marginBottom: "24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--accent-lime)",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                    }}
                  >
                    RECOMMENDED OPERATIONAL ACTION
                  </span>
                  <div style={{ fontSize: "14px", marginTop: "2px" }}>
                    {result.conclusion.recommended_action}
                  </div>
                </div>
                <button className="btn btn-accent" style={{ flexShrink: 0 }}>
                  Apply Mitigation
                </button>
              </div>
            )}

            {/* Structured Evidence Graph */}
            {result.conclusion?.evidence_graph && (
              <EvidenceGraphViewer graph={result.conclusion.evidence_graph} />
            )}

            {/* Assembled Evidence Tree */}
            <div style={{ marginTop: "24px" }}>
              <div className="eyebrow" style={{ marginBottom: "10px" }}>
                ASSEMBLED EVIDENCE ITEMS ({result.evidence.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {result.evidence.map((item, idx) => (
                  <div key={idx} className="evidence-box">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Badge type={item.type}>{item.type}</Badge>
                        <strong style={{ fontSize: "13px" }}>{item.source}</strong>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {item.description || "Authoritative data signal"}
                      </span>
                    </div>
                    <pre style={{ margin: 0, overflowX: "auto", fontSize: "12px" }}>
                      {JSON.stringify(item.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default function AiAnalystPage() {
  return (
    <Suspense fallback={<div>Loading investigation engine...</div>}>
      <AnalystContent />
    </Suspense>
  );
}
