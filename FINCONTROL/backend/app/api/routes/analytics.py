from datetime import UTC, datetime, timedelta
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.deps import Principal, get_current_principal
from app.db.session import get_db_session
from app.models.financial import Order, OrderStatus, Payment, PaymentStatus, Settlement
from app.schemas.analytics import FinancialSummary
from app.services.demo_data import generate_demo_data
from app.services.financial_metrics import financial_summary

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=FinancialSummary)
def get_summary(
    days: int = Query(default=30, ge=1, le=366),
    principal: Principal = Depends(get_current_principal),
    session: Session = Depends(get_db_session),
) -> FinancialSummary:
    period_end = datetime.now(UTC)
    return financial_summary(
        session,
        organization_id=principal.organization_id,
        period_start=period_end - timedelta(days=days),
        period_end=period_end,
    )


@router.post("/seed-demo")
def seed_demo(
    principal: Principal = Depends(get_current_principal),
    session: Session = Depends(get_db_session),
) -> dict[str, str]:
    generate_demo_data(session, organization_id=principal.organization_id)
    session.commit()
    return {"status": "ok", "message": "Demo data successfully seeded for tenant."}


@router.get("/revenue-trajectory")
def get_revenue_trajectory(
    days: int = Query(default=30, ge=7, le=90),
    principal: Principal = Depends(get_current_principal),
    session: Session = Depends(get_db_session),
) -> list[dict[str, Any]]:
    period_end = datetime.now(UTC)
    period_start = period_end - timedelta(days=days)
    orders = session.scalars(
        select(Order)
        .where(
            Order.organization_id == principal.organization_id,
            Order.status == OrderStatus.PAID,
            Order.occurred_at >= period_start,
            Order.occurred_at <= period_end,
        )
        .order_by(Order.occurred_at.asc())
    ).all()

    daily_map: dict[str, Decimal] = {}
    for i in range(days):
        d_str = (period_start + timedelta(days=i)).strftime("%Y-%m-%d")
        daily_map[d_str] = Decimal("0")

    for order in orders:
        d_str = order.occurred_at.strftime("%Y-%m-%d")
        daily_map[d_str] = daily_map.get(d_str, Decimal("0")) + order.amount

    return [{"date": k, "amount": float(v)} for k, v in sorted(daily_map.items())]


@router.get("/payments")
def get_payment_breakdown(
    principal: Principal = Depends(get_current_principal),
    session: Session = Depends(get_db_session),
) -> dict[str, Any]:
    now = datetime.now(UTC)
    period_start = now - timedelta(days=30)
    payments = list(
        session.scalars(
            select(Payment).where(
                Payment.organization_id == principal.organization_id,
                Payment.occurred_at >= period_start,
            )
        ).all()
    )
    total = len(payments)
    succeeded = sum(1 for p in payments if p.status == PaymentStatus.SUCCEEDED)
    failed = sum(1 for p in payments if p.status == PaymentStatus.FAILED)
    refunded = sum(1 for p in payments if p.status == PaymentStatus.REFUNDED)
    reasons: dict[str, int] = {}
    for p in payments:
        if p.failure_reason:
            reasons[p.failure_reason] = reasons.get(p.failure_reason, 0) + 1

    return {
        "total_payments": total,
        "succeeded": succeeded,
        "failed": failed,
        "refunded": refunded,
        "success_rate": round(succeeded / total, 4) if total else 0.0,
        "failure_reasons": reasons,
    }


@router.get("/settlements")
def get_settlements_summary(
    principal: Principal = Depends(get_current_principal),
    session: Session = Depends(get_db_session),
) -> list[dict[str, Any]]:
    records = list(
        session.scalars(
            select(Settlement)
            .where(Settlement.organization_id == principal.organization_id)
            .order_by(desc(Settlement.expected_at))
            .limit(20)
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
            "settled_at": s.settled_at.isoformat() if s.settled_at else None,
        }
        for s in records
    ]
