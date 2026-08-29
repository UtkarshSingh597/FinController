import { apiRequest } from "./client";
import { AnomalyItem } from "./types";

export async function getAnomalies(): Promise<AnomalyItem[]> {
  return apiRequest<AnomalyItem[]>("/anomalies", {}, () => [
    {
      id: "anom-01",
      entity_type: "payment",
      entity_id: "pay-9821",
      anomaly_score: "0.9124",
      severity: "critical",
      explanation_features: {
        amount: 14850.0,
        provider: "demo-pay",
        failure_reason: "provider_timeout",
        latency_ms: 12400,
      },
      detected_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: "anom-02",
      entity_type: "payment",
      entity_id: "pay-9822",
      anomaly_score: "0.8421",
      severity: "high",
      explanation_features: {
        amount: 12400.0,
        provider: "demo-pay",
        failure_reason: "provider_timeout",
        latency_ms: 9800,
      },
      detected_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "anom-03",
      entity_type: "refund",
      entity_id: "ref-410",
      anomaly_score: "0.6840",
      severity: "moderate",
      explanation_features: {
        amount: 3200.0,
        reason: "demo_return",
        speed_hours: 0.5,
      },
      detected_at: new Date(Date.now() - 14400000).toISOString(),
    },
  ]);
}
