"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { EvidenceGraphViewer } from "../../components/investigation/evidence-graph";
import { Badge } from "../../components/ui/badge";
import { NavSidebar } from "../../components/ui/nav-sidebar";
import { AnalystIcon, DownloadIcon } from "../../components/ui/icons";
import { getInvestigations, getInvestigationById, exportInvestigationBundle, InvestigationRecord } from "../../lib/api";

export default function InvestigationsListPage() {
  const [investigations, setInvestigations] = useState<InvestigationRecord[]>([]);
  const [selectedInv, setSelectedInv] = useState<InvestigationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [inspectingId, setInspectingId] = useState<string | null>(null);

  useEffect(() => {
    getInvestigations()
      .then((data) => {
        setInvestigations(Array.isArray(data) ? data : []);
      })
      .catch(() => setInvestigations([]))
      .finally(() => setLoading(false));
  }, []);

  const handleInspect = async (inv: InvestigationRecord) => {
    if (inv.evidence && inv.evidence.length > 0 && inv.conclusion) {
      setSelectedInv(inv);
    } else {
      setInspectingId(inv.id);
      try {
        const full = await getInvestigationById(inv.id);
        setSelectedInv(full || inv);
      } catch {
        setSelectedInv(inv);
      } finally {
        setInspectingId(null);
      }
    }
  };

  const handleExport = (format: "json" | "csv" | "markdown") => {
    if (!selectedInv) return;
    exportInvestigationBundle(selectedInv, format);
  };

  return (
    <div className="app-layout">
      <NavSidebar />

      <main className="main-content page-enter">
        <header className="page-header">
          <div>
            <div className="eyebrow">AUDITABLE INVESTIGATION REGISTRY</div>
            <h1 className="page-title">Past Investigations</h1>
            <p className="page-subtitle">
              Complete history of policy-routed financial investigations and generated evidence chains.
            </p>
          </div>
          <Link href="/ai-analyst" className="btn btn-primary">
            <AnalystIcon size={13} color="currentColor" />
            <span>New Investigation</span>
          </Link>
        </header>

        <section className="panel stagger-1">
          {loading ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              <span className="spinner" style={{ marginRight: "8px" }}></span>
              Loading investigation registry...
            </div>
          ) : investigations.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
                No Investigations Found
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", maxWidth: "480px", margin: "0 auto 18px", lineHeight: "1.5" }}>
                You haven&apos;t run any financial investigations yet. Submit a query in the AI Analyst workspace to generate your first auditable evidence chain.
              </p>
              <Link href="/ai-analyst" className="btn btn-primary">
                <AnalystIcon size={14} color="currentColor" />
                <span>Launch First Investigation</span>
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>Investigation ID</th>
                    <th>Inquiry Question</th>
                    <th>Policies Applied</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investigations.map((inv) => {
                    const skills = inv.skills_used || inv.conclusion?.skills || ["financial_analysis"];
                    const isInspecting = inspectingId === inv.id;
                    const isSelected = selectedInv?.id === inv.id;

                    return (
                      <tr key={inv.id} style={{ background: isSelected ? "var(--bg-surface-elevated)" : undefined }}>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>
                          {inv.id.length > 16 ? `${inv.id.slice(0, 14)}...` : inv.id}
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{inv.question}</td>
                        <td>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {skills.map((s) => (
                              <span
                                key={s}
                                style={{
                                  background: "var(--bg-surface-elevated)",
                                  border: "1px solid var(--border-default)",
                                  padding: "2px 6px",
                                  borderRadius: "var(--radius-xs)",
                                  fontSize: "11px",
                                  fontFamily: "var(--font-mono)",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <Badge type="fact">{inv.status || "completed"}</Badge>
                        </td>
                        <td style={{ color: "var(--text-muted)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                          {inv.created_at ? new Date(inv.created_at).toLocaleString() : "Recent"}
                        </td>
                        <td>
                          <button
                            className={`btn ${isSelected ? "btn-accent" : "btn-secondary"}`}
                            style={{ padding: "4px 9px", fontSize: "11.5px" }}
                            disabled={isInspecting}
                            onClick={() => handleInspect(inv)}
                          >
                            {isInspecting ? (
                              <>
                                <span className="spinner" style={{ width: "10px", height: "10px" }}></span>
                                <span>Loading...</span>
                              </>
                            ) : isSelected ? (
                              <span>Inspecting</span>
                            ) : (
                              <span>Inspect Evidence</span>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Detail Inspection Drawer */}
        {selectedInv && (
          <section className="panel page-enter" style={{ marginTop: "20px", border: "1px solid var(--border-highlight)" }}>
            <div className="panel-header">
              <div>
                <div className="eyebrow">AUDITABLE EVIDENCE DOSSIER</div>
                <h3 className="panel-title">{selectedInv.question}</h3>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => handleExport("json")}
                  className="btn btn-secondary"
                  style={{ padding: "4px 8px", fontSize: "11.5px" }}
                  title="Export JSON"
                >
                  <DownloadIcon size={12} color="currentColor" />
                  <span>JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("csv")}
                  className="btn btn-secondary"
                  style={{ padding: "4px 8px", fontSize: "11.5px" }}
                  title="Export CSV"
                >
                  <DownloadIcon size={12} color="currentColor" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("markdown")}
                  className="btn btn-secondary"
                  style={{ padding: "4px 8px", fontSize: "11.5px" }}
                  title="Export Markdown Report"
                >
                  <DownloadIcon size={12} color="currentColor" />
                  <span>MD</span>
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedInv(null)}
                  style={{ fontSize: "12px", padding: "4px 10px" }}
                >
                  Close
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "16px", fontSize: "13.5px", lineHeight: "1.6" }}>
              <div style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-mono)" }}>
                Conclusion Summary:
              </div>
              <div style={{ background: "var(--bg-surface-elevated)", padding: "14px 16px", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}>
                {selectedInv.conclusion?.text || "Autonomous investigation generated evidence nodes."}
              </div>
              {selectedInv.conclusion?.recommended_action && (
                <div style={{ marginTop: "8px", background: "var(--semantic-positive-bg)", border: "1px solid var(--semantic-positive-border)", color: "var(--semantic-positive-text)", padding: "10px 14px", borderRadius: "var(--radius-xs)", fontSize: "12.5px", fontFamily: "var(--font-mono)" }}>
                  <strong>RECOMMENDED ACTION:</strong> {selectedInv.conclusion.recommended_action}
                </div>
              )}
            </div>

            {/* Evidence Graph */}
            {selectedInv.conclusion?.evidence_graph && selectedInv.conclusion.evidence_graph.nodes?.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div className="eyebrow" style={{ marginBottom: "8px" }}>CAUSAL EVIDENCE GRAPH</div>
                <EvidenceGraphViewer graph={selectedInv.conclusion.evidence_graph} />
              </div>
            )}

            <div className="eyebrow" style={{ marginTop: "20px", marginBottom: "8px" }}>
              COLLECTED EVIDENCE ITEMS ({(selectedInv.evidence || []).length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(selectedInv.evidence && selectedInv.evidence.length > 0) ? (
                selectedInv.evidence.map((item, idx) => (
                  <div key={idx} className="evidence-box">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <Badge type={item.type}>{item.type}</Badge>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {item.source}
                      </span>
                    </div>
                    {item.description && (
                      <div style={{ marginBottom: 4, color: "var(--text-primary)", fontSize: "12px" }}>
                        {item.description}
                      </div>
                    )}
                    <pre style={{ margin: 0, overflowX: "auto", fontSize: "11.5px", color: "var(--text-secondary)" }}>
                      {JSON.stringify(item.data, null, 2)}
                    </pre>
                  </div>
                ))
              ) : (
                <div style={{ padding: "12px", color: "var(--text-muted)", fontSize: "12px", fontStyle: "italic", background: "var(--bg-surface-elevated)", borderRadius: "var(--radius-xs)" }}>
                  No individual granular evidence nodes recorded for this entry.
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
