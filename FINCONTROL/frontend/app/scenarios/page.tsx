"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { NavSidebar } from "../../components/ui/nav-sidebar";
import { runRevenueSimulation, SimulationResult } from "../../lib/api";

export default function ScenariosPage() {
  const [revenuePct, setRevenuePct] = useState<number>(-15);
  const [paymentFailPct, setPaymentFailPct] = useState<number>(10);
  const [refundPct, setRefundPct] = useState<number>(20);
  const [delayDays, setDelayDays] = useState<number>(2);

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSimulate = async () => {
    setIsLoading(true);
    try {
      const res = await runRevenueSimulation({
        percent_change: revenuePct,
        payment_failure_change: paymentFailPct,
        refund_change: refundPct,
        delay_days: delayDays,
      });
      setSimulationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSimulate();
  }, [revenuePct, paymentFailPct, refundPct, delayDays]);

  const presetScenarios = [
    {
      name: "Gateway Timeout Spike (+15% Failures)",
      rev: 0,
      fail: 15,
      refund: 5,
      delay: 0,
    },
    {
      name: "Macro Downturn (-15% Revenue, +20% Refunds)",
      rev: -15,
      fail: 8,
      refund: 20,
      delay: 3,
    },
    {
      name: "Growth Shock (+25% Volume)",
      rev: 25,
      fail: -2,
      refund: 0,
      delay: 0,
    },
  ];

  return (
    <div className="app-layout">
      <NavSidebar />

      <main className="main-content">
        <header className="page-header">
          <div>
            <div className="eyebrow">DETERMINISTIC STRESS SIMULATION ENGINE</div>
            <h1 className="page-title">Scenario Simulation Workbench</h1>
            <p className="page-subtitle">
              Model hypothetical stress-tests, fee alterations, and failure surges without mutating production financial ledgers.
            </p>
          </div>
        </header>

        {/* Preset Scenarios */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", alignSelf: "center", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
            PRESETS:
          </span>
          {presetScenarios.map((sc, i) => (
            <button
              key={i}
              className="sample-pill"
              onClick={() => {
                setRevenuePct(sc.rev);
                setPaymentFailPct(sc.fail);
                setRefundPct(sc.refund);
                setDelayDays(sc.delay);
              }}
            >
              {sc.name}
            </button>
          ))}
        </div>

        <div className="grid-2col">
          {/* Controls Panel */}
          <article className="panel">
            <div className="panel-header">
              <div>
                <div className="eyebrow">HYPOTHETICAL PARAMETERS</div>
                <h3 className="panel-title">Stress Test Levers</h3>
              </div>
              <Badge type="simulation">READ-ONLY</Badge>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Revenue Delta */}
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label className="form-label">Gross Revenue Variance (%)</label>
                  <strong style={{ fontFamily: "var(--font-mono)", color: revenuePct < 0 ? "var(--semantic-critical-text)" : "var(--semantic-positive-text)" }}>
                    {revenuePct > 0 ? `+${revenuePct}` : revenuePct}%
                  </strong>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="100"
                  step="1"
                  value={revenuePct}
                  onChange={(e) => setRevenuePct(Number(e.target.value))}
                  className="range-slider"
                />
              </div>

              {/* Payment Failure Delta */}
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label className="form-label">Payment Failure Surge (%)</label>
                  <strong style={{ fontFamily: "var(--font-mono)", color: paymentFailPct > 0 ? "var(--semantic-critical-text)" : "var(--semantic-positive-text)" }}>
                    {paymentFailPct > 0 ? `+${paymentFailPct}` : paymentFailPct}%
                  </strong>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="50"
                  step="1"
                  value={paymentFailPct}
                  onChange={(e) => setPaymentFailPct(Number(e.target.value))}
                  className="range-slider"
                />
              </div>

              {/* Refund Delta */}
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label className="form-label">Refund Volume Increase (%)</label>
                  <strong style={{ fontFamily: "var(--font-mono)", color: refundPct > 0 ? "var(--semantic-critical-text)" : "var(--text-primary)" }}>
                    {refundPct > 0 ? `+${refundPct}` : refundPct}%
                  </strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={refundPct}
                  onChange={(e) => setRefundPct(Number(e.target.value))}
                  className="range-slider"
                />
              </div>

              {/* Settlement Delay */}
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label className="form-label">Settlement Transit Delay</label>
                  <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                    +{delayDays} Days
                  </strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="14"
                  step="1"
                  value={delayDays}
                  onChange={(e) => setDelayDays(Number(e.target.value))}
                  className="range-slider"
                />
              </div>
            </div>
          </article>

          {/* Simulation Output Card */}
          <article
            className="panel"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div className="panel-header">
                <div>
                  <div className="eyebrow">PROJECTION OUTCOME</div>
                  <h3 className="panel-title">Simulated Financial Impact</h3>
                </div>
                <Badge type="simulation">SIMULATION</Badge>
              </div>

              {simulationResult && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-mono)" }}>
                      Projected Net Revenue
                    </span>
                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        letterSpacing: "-0.02em",
                        margin: "4px 0",
                        fontVariantNumeric: "tabular-nums",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      ${Number(simulationResult.projected_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={{ background: "var(--bg-surface-elevated)", padding: "10px 12px", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-default)" }}>
                      <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>BASELINE</span>
                      <div style={{ fontWeight: 600, fontSize: "15px", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                        ${Number(simulationResult.baseline_revenue).toLocaleString()}
                      </div>
                    </div>

                    <div style={{ background: "var(--bg-surface-elevated)", padding: "10px 12px", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-default)" }}>
                      <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>ESTIMATED DELTA</span>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "15px",
                          fontFamily: "var(--font-mono)",
                          marginTop: "2px",
                          color: Number(simulationResult.impact) < 0 ? "var(--semantic-critical-text)" : "var(--semantic-positive-text)",
                        }}
                      >
                        {Number(simulationResult.impact) > 0 ? "+" : ""}
                        ${Number(simulationResult.impact).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.5", background: "var(--bg-surface-subtle)", padding: "12px", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
                    <strong style={{ color: "var(--text-primary)" }}>Assumptions:</strong> {simulationResult.assumption}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: "16px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Strict safety policy: Simulated values are mathematical models and never alter production ledger accounts.
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
