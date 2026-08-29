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

    // Trigger direct download or fallback to client JSON
    if (token) {
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.blob())
        .then((blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = `fincontrol_investigation_${invId.slice(0, 8)}.${format === "markdown" ? "md" : format}`;
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
    a.download = `fincontrol_investigation_${result.id.slice(0, 8)}.json`;
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

      <main className="main-content">
        <header className="page-header">
          <div>
            <div className="eyebrow">AUTONOMOUS INVESTIGATION WORKSPACE</div>
            <h1 className="page-title">AI Financial Analyst</h1>
            <p className="page-subtitle">
              Interrogate financial books, trace root-cause evidence, and verify deterministic hypotheses.
            </p>
          </div>
        </header>

        {/* Input Query Bar */}
        <section className="panel">
          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <input
              type="text"
              className="input-field"
              style={{ flex: 1, fontSize: "15px" }}
              placeholder="Ask why money moved (e.g. 'Why did revenue drop yesterday?', 'Which payments are anomalous?')..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStartInvestigation()}
              disabled={isInvestigating}
            />
            <button
              className="btn btn-primary"
              style={{ padding: "0 24px" }}
              onClick={() => handleStartInvestigation()}
              disabled={isInvestigating || !question.trim()}
            >
              {isInvestigating ? "Investigating..." : "Investigate →"}
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
              Sample Inquiries:
            </span>
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuestion(sq);
                  handleStartInvestigation(sq);
                }}
                disabled={isInvestigating}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-subtle)",
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
                        background: "rgba(183, 242, 106, 0.15)",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--accent-lime)",
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
          <section className="panel" style={{ marginTop: "24px", border: "1px solid var(--accent-lime)" }}>
            <div className="panel-header">
              <div>
                <div className="eyebrow" style={{ color: "var(--accent-lime)" }}>
                  AUDITABLE CONCLUSION
                </div>
                <h2 style={{ fontSize: "20px", color: "var(--text-primary)" }}>
                  Investigation Findings & Recommended Mitigation
                </h2>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                    onClick={() => handleExport("json")}
                  >
                    Export JSON
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                    onClick={() => handleExport("csv")}
                  >
                    Export CSV
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                    onClick={() => handleExport("markdown")}
                  >
                    Export MD
                  </button>
                </div>
                <Badge type="hypothesis">HYPOTHESIS</Badge>
                <Badge type="fact">CONFIDENCE: {result.conclusion?.confidence?.toUpperCase() || "HIGH"}</Badge>
              </div>
            </div>

            {/* Synthesized Explanation */}
            <div
              style={{
                backgroundColor: "rgba(183, 242, 106, 0.05)",
                borderLeft: "4px solid var(--accent-lime)",
                padding: "16px 20px",
                borderRadius: "0 8px 8px 0",
                fontSize: "14px",
                lineHeight: "1.7",
                color: "var(--text-primary)",
                marginBottom: "20px",
              }}
            >
              {result.conclusion?.text}
            </div>

            {/* Recommended Action */}
            {result.conclusion?.recommended_action && (
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
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
                <button className="btn btn-primary" style={{ flexShrink: 0, fontSize: "12px" }}>
                  Acknowledge Action
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
                marginTop: "28px",
                padding: "20px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="eyebrow" style={{ color: "var(--accent-cyan)", marginBottom: "8px" }}>
                MULTI-TURN EVIDENCE INTERROGATION
              </div>
              <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>
                Drill Down into Investigation Evidence
              </h3>

              {/* Follow-up History */}
              {result.conclusion?.follow_ups && result.conclusion.follow_ups.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                  {result.conclusion.follow_ups.map((fu, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.04)",
                        borderLeft: "3px solid var(--accent-cyan)",
                      }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--accent-cyan)" }}>
                        Q: {fu.question}
                      </div>
                      <div style={{ fontSize: "13px", marginTop: "4px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                        {fu.answer}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
                        Verified via policy: <code style={{ fontFamily: "var(--font-mono)" }}>{fu.skill}</code>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Follow-up Form */}
              <form onSubmit={handleFollowUpSubmit} style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  className="input-field"
                  style={{ flex: 1, fontSize: "14px" }}
                  placeholder="Ask a clarifying follow-up (e.g. 'Can you check if gateway timeouts contributed to this?')..."
                  value={followupQuestion}
                  onChange={(e) => setFollowupQuestion(e.target.value)}
                  disabled={isFollowupLoading}
                />
                <button
                  type="submit"
                  className="btn btn-secondary"
                  style={{ padding: "0 18px", fontSize: "13px" }}
                  disabled={isFollowupLoading || !followupQuestion.trim()}
                >
                  {isFollowupLoading ? "Analyzing..." : "Ask Follow-up →"}
                </button>
              </form>
            </div>

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
