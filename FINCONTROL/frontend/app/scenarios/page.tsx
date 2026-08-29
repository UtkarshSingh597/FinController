"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { KpiCard } from "../../components/ui/kpi-card";
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
      name: "Mild Recession (-15% Revenue, +20% Refunds)",
      rev: -15,
      fail: 8,
      refund: 20,
      delay: 3,
    },
    {
      name: "Optimistic Growth (+25% Volume)",
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
            <div className="eyebrow">DETERMINISTIC WHAT-IF SIMULATION ENGINE</div>
            <h1 className="page-title">Scenario Simulation Workbench</h1>
            <p className="page-subtitle">
              Model hypothetical stress-tests, fee alterations, and failure surges without mutating production financial ledgers.
            </p>
          </div>
        </header>

        {/* Preset Scenarios */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", alignSelf: "center" }}>
            Quick Presets:
          </span>
          {presetScenarios.map((sc, i) => (
            <button
              key={i}
              className="btn btn-secondary"
              style={{ fontSize: "12px", padding: "6px 12px" }}
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
              <Badge type="simulation">READ-ONLY ENGINE</Badge>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Revenue Delta */}
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label className="form-label">Gross Revenue Variance (%)</label>
                  <strong style={{ fontFamily: "var(--font-mono)", color: revenuePct < 0 ? "#dc2626" : "#059669" }}>
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
                  <strong style={{ fontFamily: "var(--font-mono)", color: paymentFailPct > 0 ? "#dc2626" : "#059669" }}>
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
                  <strong style={{ fontFamily: "var(--font-mono)", color: refundPct > 0 ? "#dc2626" : "inherit" }}>
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
                  <strong style={{ fontFamily: "var(--font-mono)" }}>
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
              backgroundColor: "#fdf8ff",
              border: "1px solid #e9d5ff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div className="panel-header" style={{ borderBottomColor: "#f3e8ff" }}>
                <div>
                  <div className="eyebrow" style={{ color: "#7e22ce" }}>
                    PROJECTION OUTCOME
                  </div>
                  <h3 className="panel-title" style={{ color: "#581c87" }}>
                    Simulated Financial Impact
                  </h3>
                </div>
                <Badge type="simulation">SIMULATION</Badge>
              </div>

              {simulationResult && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      Projected Period Revenue:
                    </span>
                    <div
                      style={{
                        fontSize: "32px",
                        fontWeight: 800,
                        color: "#581c87",
                        letterSpacing: "-0.02em",
                        margin: "4px 0",
                      }}
                    >
                      ${Number(simulationResult.projected_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ background: "#ffffff", padding: "12px", borderRadius: 6, border: "1px solid #f3e8ff" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>BASELINE</span>
                      <div style={{ fontWeight: 700, fontSize: "16px" }}>
                        ${Number(simulationResult.baseline_revenue).toLocaleString()}
                      </div>
                    </div>

                    <div style={{ background: "#ffffff", padding: "12px", borderRadius: 6, border: "1px solid #f3e8ff" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>ESTIMATED DELTA</span>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "16px",
                          color: Number(simulationResult.impact) < 0 ? "#dc2626" : "#059669",
                        }}
                      >
                        {Number(simulationResult.impact) > 0 ? "+" : ""}
                        ${Number(simulationResult.impact).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: "13px", color: "#6b21a8", lineHeight: "1.6", background: "#f5e8ff", padding: "12px", borderRadius: 6 }}>
                    <strong>Assumptions:</strong> {simulationResult.assumption}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: "20px" }}>
              <div style={{ fontSize: "11px", color: "#9333ea", marginBottom: 8 }}>
                * Strict safety policy: Simulated values are never committed to production financial accounts.
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
