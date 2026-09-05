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
import {
  ArrowRightIcon,
  CheckIcon,
} from "../../components/ui/icons";
import {
  createInvestigation,
  submitInvestigationFollowUp,
  InvestigationRecord,
} from "../../lib/api";

function AnalystContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [question, setQuestion] = useState(initialQuery);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<InvestigationStepKey[]>([]);
  const [currentStep, setCurrentStep] = useState<InvestigationStepKey | undefined>(undefined);
  const [result, setResult] = useState<InvestigationRecord | null>(null);

  // Multi-Turn Interrogation State
  const [followupQuestion, setFollowupQuestion] = useState("");
  const [isFollowupLoading, setIsFollowupLoading] = useState(false);

  const sampleQuestions = [
    "Why did revenue fall over the last 3 days?",
    "Why are card payments declining with provider timeouts?",
    "What if refunds increase by 40% next 3 months?",
    "Is there revenue leakage between payments and settlements?",
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
    await new Promise((r) => setTimeout(r, 450));
    setCompletedSteps(["routing"]);

    // Step 2: Evidence
    setCurrentStep("evidence");
    await new Promise((r) => setTimeout(r, 550));
    setCompletedSteps(["routing", "evidence"]);

    // Step 3: Anomalies & ML
    setCurrentStep("anomalies");
    await new Promise((r) => setTimeout(r, 450));
    setCompletedSteps(["routing", "evidence", "anomalies"]);

    // Step 4: Synthesis
    setCurrentStep("synthesis");
    await new Promise((r) => setTimeout(r, 400));
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

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || !followupQuestion.trim() || isFollowupLoading) return;

    setIsFollowupLoading(true);
    try {
      const updated = await submitInvestigationFollowUp(result.id, followupQuestion);
      setResult(updated);
      setFollowupQuestion("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsFollowupLoading(false);
    }
  };

  const handleExport = (format: "json" | "csv" | "markdown") => {
    if (!result) return;
    const invId = result.id;
    const token = typeof window !== "undefined" ? localStorage.getItem("fincontrol_token") : null;
    const url = `http://localhost:8000/api/v1/investigations/${invId}/export?format=${format}`;

    if (token) {
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = `artha_investigation_${invId.slice(0, 8)}.${format === "markdown" ? "md" : format}`;
          a.click();
          window.URL.revokeObjectURL(blobUrl);
        })
        .catch(() => {
          downloadClientJSON();
        });
    } else {
      downloadClientJSON();
    }
  };

  const downloadClientJSON = () => {
    if (!result) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `artha_investigation_${result.id.slice(0, 8)}.json`;
    a.click();
  };

  useEffect(() => {
    if (initialQuery) {
      handleStartInvestigation(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="app-layout">
      <NavSidebar />

      <main className="main-content page-enter">
        <header className="page-header">
          <div>
            <div className="eyebrow">INVESTIGATION WORKSPACE</div>
            <h1 className="page-title">Financial Intelligence Analyst</h1>
            <p className="page-subtitle">
              Autonomous, auditable root-cause investigation across payment telemetry, ledger facts, and ML anomaly models.
            </p>
          </div>
        </header>

        {/* Technical Input Inquiry Bar */}
        <section className="panel" style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, minWidth: "260px" }}
              placeholder="Enter financial inquiry (e.g. 'Why did revenue decline over the last 3 days?')..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStartInvestigation()}
              disabled={isInvestigating}
            />
            <button
              className="btn btn-primary"
              onClick={() => handleStartInvestigation()}
              disabled={isInvestigating || !question.trim()}
            >
              <span>{isInvestigating ? "Executing Investigation..." : "Execute Investigation"}</span>
              <ArrowRightIcon size={13} color="currentColor" />
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
              SAMPLE QUERIES:
            </span>
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                type="button"
                className="sample-pill"
                onClick={() => {
                  setQuestion(sq);
                  handleStartInvestigation(sq);
                }}
                disabled={isInvestigating}
              >
                {sq}
              </button>
            ))}
          </div>
        </section>

        {/* Execution Pipeline & Policy Context */}
        <div className="grid-2col">
          {/* Progress Tracker */}
          <article className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">SYSTEM PIPELINE</div>
                <h3 className="panel-title">Investigation Execution Stages</h3>
              </div>
              <Badge type={isInvestigating ? "prediction" : "fact"}>
                {isInvestigating ? "EXECUTING" : "VERIFIED"}
              </Badge>
            </div>

            <InvestigationProgress completed={completedSteps} currentStep={currentStep} />
          </article>

          {/* Orchestration Bounds */}
          <article className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">CAPABILITY BOUNDS</div>
                <h3 className="panel-title">Orchestration Parameters</h3>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "10.5px", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                  TENANT CONTEXT
                </span>
                <strong style={{ color: "var(--text-primary)" }}>NovaPay FinTech (Tenant-Scoped)</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "10.5px", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                  ACTIVE POLICIES
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                  {(result?.conclusion?.skills || [
                    "investigation_orchestrator",
                    "revenue_investigation",
                    "payment_analysis",
                  ]).map((s) => (
                    <span
                      key={s}
                      style={{
                        background: "var(--bg-surface-elevated)",
                        padding: "2px 6px",
                        borderRadius: "var(--radius-xs)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-default)",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "10.5px", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                  SYNTHESIS MODEL
                </span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)", fontSize: "12px" }}>
                  Qwen3:8b (Local Ollama Adapter)
                </span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block", fontSize: "10.5px", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                  SECURITY CONTRACT
                </span>
                <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                  Strict Read-Only MCP Tool Protocol
                </span>
              </div>
            </div>
          </article>
        </div>

        {/* Investigation Conclusion & Evidence Workspace */}
        {result && (
          <section className="panel" style={{ marginTop: "20px" }}>
            <div className="panel-header" style={{ flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div className="eyebrow">AUDITABLE CONCLUSION</div>
                <h2 style={{ fontSize: "18px", color: "var(--text-primary)", fontWeight: 700 }}>
                  Root-Cause Findings & Recommended Action
                </h2>
              </div>
              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: "11.5px", padding: "4px 8px" }}
                    onClick={() => handleExport("json")}
                  >
                    JSON
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: "11.5px", padding: "4px 8px" }}
                    onClick={() => handleExport("csv")}
                  >
                    CSV
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: "11.5px", padding: "4px 8px" }}
                    onClick={() => handleExport("markdown")}
                  >
                    Markdown
                  </button>
                </div>
                <Badge type="hypothesis">HYPOTHESIS</Badge>
                <Badge type="fact">CONFIDENCE: {result.conclusion?.confidence?.toUpperCase() || "HIGH"}</Badge>
              </div>
            </div>

            {/* Synthesized Finding */}
            <div
              style={{
                backgroundColor: "var(--bg-surface-elevated)",
                borderLeft: "3px solid var(--border-strong)",
                padding: "14px 18px",
                borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                fontSize: "13.5px",
                lineHeight: "1.6",
                color: "var(--text-primary)",
                marginBottom: "18px",
              }}
            >
              {result.conclusion?.text}
            </div>

            {/* Recommended Action */}
            {result.conclusion?.recommended_action && (
              <div
                style={{
                  background: "var(--bg-surface-subtle)",
                  border: "1px solid var(--border-default)",
                  padding: "14px 18px",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "10.5px",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    RECOMMENDED OPERATIONAL ACTION
                  </span>
                  <div style={{ fontSize: "13.5px", marginTop: "3px", color: "var(--text-primary)" }}>
                    {result.conclusion.recommended_action}
                  </div>
                </div>
                <button className="btn btn-secondary" style={{ flexShrink: 0, fontSize: "12px" }}>
                  <CheckIcon size={12} color="currentColor" />
                  <span>Acknowledge Action</span>
                </button>
              </div>
            )}

            {/* Structured Evidence Graph */}
            {result.conclusion?.evidence_graph && (
              <EvidenceGraphViewer graph={result.conclusion.evidence_graph} />
            )}

            {/* Multi-Turn Interrogation Drawer */}
            <div
              style={{
                marginTop: "24px",
                padding: "18px",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-surface-subtle)",
                border: "1px solid var(--border-default)",
              }}
            >
              <div className="eyebrow" style={{ marginBottom: "4px" }}>
                MULTI-TURN EVIDENCE INTERROGATION
              </div>
              <h3 style={{ fontSize: "14px", marginBottom: "12px", fontWeight: 600 }}>
                Drill Down into Investigation Evidence
              </h3>

              {/* Follow-up History */}
              {result.conclusion?.follow_ups && result.conclusion.follow_ups.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  {result.conclusion.follow_ups.map((fu, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "var(--radius-xs)",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderLeft: "2px solid var(--border-strong)",
                      }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                        Q: {fu.question}
                      </div>
                      <div style={{ fontSize: "13px", marginTop: "4px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                        {fu.answer}
                      </div>
                      <div style={{ fontSize: "10.5px", color: "var(--text-muted)", marginTop: "6px", fontFamily: "var(--font-mono)" }}>
                        Verified via policy: {fu.skill}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Follow-up Form */}
              <form onSubmit={handleFollowUpSubmit} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, minWidth: "220px" }}
                  placeholder="Ask a clarifying follow-up question..."
                  value={followupQuestion}
                  onChange={(e) => setFollowupQuestion(e.target.value)}
                  disabled={isFollowupLoading}
                />
                <button
                  type="submit"
                  className="btn btn-secondary"
                  disabled={isFollowupLoading || !followupQuestion.trim()}
                >
                  <span>{isFollowupLoading ? "Evaluating..." : "Submit Follow-up"}</span>
                  <ArrowRightIcon size={12} color="currentColor" />
                </button>
              </form>
            </div>

            {/* Assembled Evidence Items */}
            <div style={{ marginTop: "24px" }}>
              <div className="eyebrow" style={{ marginBottom: "10px" }}>
                COLLECTED EVIDENCE ITEMS ({result.evidence.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {result.evidence.map((item, idx) => (
                  <div key={idx} className="evidence-box">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                        flexWrap: "wrap",
                        gap: "6px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Badge type={item.type}>{item.type}</Badge>
                        <strong style={{ fontSize: "12.5px", color: "var(--text-primary)" }}>{item.source}</strong>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {item.description || "Authoritative data signal"}
                      </span>
                    </div>
                    <pre style={{ margin: 0, overflowX: "auto", fontSize: "11.5px", color: "var(--text-secondary)" }}>
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
    <Suspense fallback={<div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>Loading investigation engine...</div>}>
      <AnalystContent />
    </Suspense>
  );
}
