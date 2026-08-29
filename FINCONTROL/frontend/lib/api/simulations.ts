import { apiRequest } from "./client";
import { SimulationResult } from "./types";

export interface SimulationPayload {
  percent_change: number;
  payment_failure_change?: number;
  refund_change?: number;
  delay_days?: number;
}

export async function runRevenueSimulation(payload: SimulationPayload): Promise<SimulationResult> {
  return apiRequest<SimulationResult>(
    "/simulations/revenue",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    () => {
      const baseline = 284820.0;
      const revMultiplier = 1 + payload.percent_change / 100;
      const failImpact = (payload.payment_failure_change ?? 0) * 0.008;
      const refImpact = (payload.refund_change ?? 0) * 0.003;
      const netMultiplier = Math.max(0, revMultiplier - failImpact - refImpact);
      const projected = baseline * netMultiplier;
      const impact = projected - baseline;

      return {
        baseline_revenue: baseline.toFixed(2),
        projected_revenue: projected.toFixed(2),
        impact: impact.toFixed(2),
        assumption: `Simulated variance: rev ${payload.percent_change}%, fail ${payload.payment_failure_change ?? 0}%, refund ${payload.refund_change ?? 0}%, delay ${payload.delay_days ?? 0}d.`,
        scenario_details: payload,
        classification: "SIMULATION",
      };
    }
  );
}
