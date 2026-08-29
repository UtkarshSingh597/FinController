import { apiRequest } from "./client";
import {
  FinancialSummary,
  PaymentBreakdown,
  RevenueDataPoint,
  SettlementItem,
} from "./types";

export async function getFinancialSummary(days = 30): Promise<FinancialSummary> {
  return apiRequest<FinancialSummary>(
    `/analytics/summary?days=${days}`,
    {},
    () => ({
      period_start: new Date(Date.now() - 30 * 86400000).toISOString(),
      period_end: new Date().toISOString(),
      revenue: "284820.00",
      order_count: 284,
      average_order_value: "1002.88",
      payment_success_rate: "0.9680",
      refund_amount: "14200.00",
      pending_settlement: "38420.00",
      expenses: "99220.00",
      net_cash_flow: "171400.00",
    })
  );
}

export async function getRevenueTrajectory(days = 30): Promise<RevenueDataPoint[]> {
  return apiRequest<RevenueDataPoint[]>(
    `/analytics/revenue-trajectory?days=${days}`,
    {},
    () => {
      const points: RevenueDataPoint[] = [];
      const now = Date.now();
      for (let i = days; i >= 0; i -= 3) {
        const d = new Date(now - i * 86400000);
        points.push({
          date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          amount: Math.floor(7000 + Math.random() * 3500 - (i < 6 ? 2000 : 0)),
        });
      }
      return points;
    }
  );
}

export async function getPaymentBreakdown(): Promise<PaymentBreakdown> {
  return apiRequest<PaymentBreakdown>("/analytics/payments", {}, () => ({
    total_payments: 360,
    succeeded: 312,
    failed: 48,
    refunded: 14,
    success_rate: 0.8667,
    failure_reasons: {
      provider_timeout: 38,
      insufficient_funds: 6,
      card_declined: 4,
    },
  }));
}

export async function getSettlementsSummary(): Promise<SettlementItem[]> {
  return apiRequest<SettlementItem[]>("/analytics/settlements", {}, () => [
    {
      id: "settle-01",
      provider: "demo-pay",
      expected_amount: 38420.0,
      actual_amount: null,
      status: "pending",
      expected_at: new Date(Date.now() + 86400000).toISOString(),
      settled_at: null,
    },
    {
      id: "settle-02",
      provider: "demo-pay",
      expected_amount: 42100.0,
      actual_amount: 42100.0,
      status: "paid",
      expected_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      settled_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "settle-03",
      provider: "demo-pay",
      expected_amount: 29800.0,
      actual_amount: null,
      status: "delayed",
      expected_at: new Date(Date.now() - 86400000).toISOString(),
      settled_at: null,
    },
  ]);
}

export async function seedDemoData(): Promise<{ status: string; message: string }> {
  return apiRequest<{ status: string; message: string }>(
    "/analytics/seed-demo",
    { method: "POST" },
    () => ({ status: "ok", message: "Demo data active." })
  );
}
