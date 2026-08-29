from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ml.anomaly import AnomalyResult, detect_payment_amount_anomalies
from app.ml.risk import RiskAssessmentResult, evaluate_financial_risk
from app.models.financial import (
    Expense,
    Order,
    OrderStatus,
    Payment,
    PaymentStatus,
    Refund,
    Settlement,
)
from app.schemas.analytics import FinancialSummary
from app.services.financial_metrics import financial_summary
from app.services.simulation import SimulationResult, simulate_scenario


@dataclass(frozen=True)
class ToolContext:
    """Trusted context supplied by the authenticated application boundary only."""

    organization_id: UUID
    user_id: UUID


def get_financial_summary(
    session: Session, *, context: ToolContext, period_start: datetime, period_end: datetime
) -> FinancialSummary:
    """Read-only summary; organization scope comes exclusively from trusted context."""
    return financial_summary(
        session,
        organization_id=context.organization_id,
        period_start=period_start,
        period_end=period_end,
    )


def get_payment_breakdown_mcp(
    session: Session, *, context: ToolContext, period_start: datetime, period_end: datetime
) -> dict:
    """Read-only payment health; strictly tenant-scoped."""
    payments = list(
        session.scalars(
            select(Payment).where(
                Payment.organization_id == context.organization_id,
                Payment.occurred_at >= period_start,
                Payment.occurred_at <= period_end,
            )
        ).all()
    )
    total = len(payments)
    succeeded = sum(1 for p in payments if p.status == PaymentStatus.SUCCEEDED)
    failed = sum(1 for p in payments if p.status == PaymentStatus.FAILED)
    reasons: dict[str, int] = {}
    for p in payments:
        if p.failure_reason:
            reasons[p.failure_reason] = reasons.get(p.failure_reason, 0) + 1

    return {
        "total_payments": total,
        "succeeded": succeeded,
        "failed": failed,
        "success_rate": round(succeeded / total, 4) if total else 0.0,
        "failure_reasons": reasons,
    }


def get_settlement_reconciliation_mcp(
    session: Session, *, context: ToolContext
) -> list[dict]:
    """Read-only settlement tracking; strictly tenant-scoped."""
    settlements = list(
        session.scalars(
            select(Settlement).where(Settlement.organization_id == context.organization_id)
        ).all()
    )
    return [
        {
            "id": str(s.id),
            "provider": s.provider,
            "expected_amount": float(s.expected_amount),
            "actual_amount": float(s.actual_amount) if s.actual_amount else None,
            "status": s.status.value if hasattr(s.status, "value") else str(s.status),
            "expected_at": s.expected_at.isoformat(),
        }
        for s in settlements
    ]


def find_revenue_leakage_mcp(
    session: Session, *, context: ToolContext, period_start: datetime, period_end: datetime
) -> dict:
    """Detect order vs payment vs settlement discrepancies."""
    orders_total = session.scalar(
        select(Order.amount)
        .where(
            Order.organization_id == context.organization_id,
            Order.status == OrderStatus.PAID,
            Order.occurred_at >= period_start,
            Order.occurred_at <= period_end,
        )
    ) or Decimal("0")

    payments_succeeded = session.scalar(
        select(Payment.amount)
        .where(
            Payment.organization_id == context.organization_id,
            Payment.status == PaymentStatus.SUCCEEDED,
            Payment.occurred_at >= period_start,
            Payment.occurred_at <= period_end,
        )
    ) or Decimal("0")

    refunds_total = session.scalar(
        select(Refund.amount)
        .where(
            Refund.organization_id == context.organization_id,
            Refund.occurred_at >= period_start,
            Refund.occurred_at <= period_end,
        )
    ) or Decimal("0")

    mismatch = abs(orders_total - payments_succeeded)

    return {
        "orders_revenue": float(orders_total),
        "payments_captured": float(payments_succeeded),
        "refunds_issued": float(refunds_total),
        "unreconciled_discrepancy": float(mismatch),
        "has_leakage": mismatch > Decimal("100"),
    }


def get_cashflow_statement_mcp(
    session: Session, *, context: ToolContext, period_start: datetime, period_end: datetime
) -> dict:
    """Read-only cash flow ledger breakdown."""
    summary = financial_summary(
        session,
        organization_id=context.organization_id,
        period_start=period_start,
        period_end=period_end,
    )
    expenses = list(
        session.scalars(
            select(Expense).where(
                Expense.organization_id == context.organization_id,
                Expense.occurred_at >= period_start,
                Expense.occurred_at <= period_end,
            )
        ).all()
    )
    expense_categories: dict[str, float] = {}
    for exp in expenses:
        expense_categories[exp.category] = (
            expense_categories.get(exp.category, 0.0) + float(exp.amount)
        )

    return {
        "gross_inflows": float(summary.revenue),
        "refund_outflows": float(summary.refund_amount),
        "expense_outflows": float(summary.expenses),
        "net_cash_flow": float(summary.net_cash_flow),
        "expense_breakdown": expense_categories,
    }


def detect_anomalies_mcp(
    session: Session, *, context: ToolContext, period_start: datetime
) -> list[AnomalyResult]:
    """ML anomaly evaluation; strictly tenant-scoped."""
    payments = list(
        session.scalars(
            select(Payment).where(
                Payment.organization_id == context.organization_id,
                Payment.occurred_at >= period_start,
            )
        ).all()
    )
    amounts = [p.amount for p in payments if p.amount is not None]
    if len(amounts) < 8:
        return []
    return detect_payment_amount_anomalies(amounts)


def evaluate_financial_risk_mcp(
    session: Session, *, context: ToolContext, period_start: datetime, period_end: datetime
) -> RiskAssessmentResult:
    """ML financial risk scoring; strictly tenant-scoped."""
    summary = financial_summary(
        session,
        organization_id=context.organization_id,
        period_start=period_start,
        period_end=period_end,
    )
    return evaluate_financial_risk(
        revenue=summary.revenue,
        refund_amount=summary.refund_amount,
        payment_success_rate=summary.payment_success_rate,
        net_cash_flow=summary.net_cash_flow,
    )


def run_scenario_mcp(
    *,
    baseline_revenue: Decimal,
    percent_change: Decimal,
    payment_failure_change: Decimal | None = None,
    refund_change: Decimal | None = None,
    delay_days: int | None = None,
) -> SimulationResult:
    """Read-only deterministic scenario simulation tool."""
    return simulate_scenario(
        baseline_revenue=baseline_revenue,
        percent_change=percent_change,
        payment_failure_change=payment_failure_change,
        refund_change=refund_change,
        delay_days=delay_days,
    )
