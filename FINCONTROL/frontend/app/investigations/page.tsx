"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { EvidenceGraphViewer } from "../../components/investigation/evidence-graph";
import { Badge } from "../../components/ui/badge";
import { NavSidebar } from "../../components/ui/nav-sidebar";
import { AnalystIcon, CrossIcon } from "../../components/ui/icons";
import { getInvestigations, InvestigationRecord } from "../../lib/api";

export default function InvestigationsListPage() {
  const [investigations, setInvestigations] = useState<InvestigationRecord[]>([]);
  const [selectedInv, setSelectedInv] = useState<InvestigationRecord | null>(null);

  useEffect(() => {
    getInvestigations().then(setInvestigations);
  }, []);

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

        <section className="panel">
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
                {investigations.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {inv.id.slice(0, 12)}...
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{inv.question}</td>
                    <td>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {(inv.conclusion?.skills || ["financial_analysis"]).map((s) => (
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
                      <Badge type="fact">{inv.status}</Badge>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                      {new Date(inv.created_at).toLocaleString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "3px 8px", fontSize: "11.5px" }}
                        onClick={() => setSelectedInv(inv)}
                      >
                        Inspect Evidence
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detail Inspection Drawer */}
        {selectedInv && (
          <section className="panel" style={{ marginTop: "20px", border: "1px solid var(--border-strong)" }}>
            <div className="panel-header">
              <div>
                <div className="eyebrow">INVESTIGATION DETAILS</div>
                <h3 className="panel-title">{selectedInv.question}</h3>
              </div>
              <button className="btn btn-secondary" onClick={() => setSelectedInv(null)} style={{ fontSize: "12px" }}>
                Close
              </button>
            </div>

            <div style={{ marginBottom: "16px", fontSize: "13.5px", lineHeight: "1.6" }}>
              <div style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-mono)" }}>
                Conclusion Summary:
              </div>
              <div style={{ background: "var(--bg-surface-elevated)", padding: "14px 16px", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}>
                {selectedInv.conclusion?.text || "No conclusion text."}
              </div>
            </div>

            {/* Evidence Graph */}
            {selectedInv.conclusion?.evidence_graph && (
              <EvidenceGraphViewer graph={selectedInv.conclusion.evidence_graph} />
            )}

            <div className="eyebrow" style={{ marginTop: "20px", marginBottom: "8px" }}>
              COLLECTED EVIDENCE ITEMS ({selectedInv.evidence.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {selectedInv.evidence.map((item, idx) => (
                <div key={idx} className="evidence-box">
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <Badge type={item.type}>{item.type}</Badge>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {item.source}
                    </span>
                  </div>
                  <pre style={{ margin: 0, overflowX: "auto", fontSize: "11.5px", color: "var(--text-secondary)" }}>
                    {JSON.stringify(item.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
