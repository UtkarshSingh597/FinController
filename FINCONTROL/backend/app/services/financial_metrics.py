from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models.financial import (
    Expense,
    Order,
    OrderStatus,
    Payment,
    PaymentStatus,
    Refund,
    Settlement,
    SettlementStatus,
)
from app.schemas.analytics import FinancialSummary


def financial_summary(
    session: Session, *, organization_id: UUID, period_start: datetime, period_end: datetime
) -> FinancialSummary:
    def period(column):
        return (column >= period_start, column < period_end)

    revenue, orders = session.execute(
        select(func.coalesce(func.sum(Order.amount), 0), func.count(Order.id)).where(
            Order.organization_id == organization_id,
            Order.status == OrderStatus.PAID,
            *period(Order.occurred_at),
        )
    ).one()
    total, succeeded = session.execute(
        select(
            func.count(Payment.id),
            func.coalesce(
                func.sum(case((Payment.status == PaymentStatus.SUCCEEDED, 1), else_=0)), 0
            ),
        ).where(Payment.organization_id == organization_id, *period(Payment.occurred_at))
    ).one()
    refunds = session.scalar(
        select(func.coalesce(func.sum(Refund.amount), 0)).where(
            Refund.organization_id == organization_id, *period(Refund.occurred_at)
        )
    )
    expenses = session.scalar(
        select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.organization_id == organization_id, *period(Expense.occurred_at)
        )
    )
    pending = session.scalar(
        select(func.coalesce(func.sum(Settlement.expected_amount), 0)).where(
            Settlement.organization_id == organization_id,
            Settlement.status == SettlementStatus.PENDING,
        )
    )
    revenue_decimal = Decimal(revenue)
    refund_decimal = Decimal(refunds)
    expense_decimal = Decimal(expenses)
    return FinancialSummary(
        period_start=period_start,
        period_end=period_end,
        revenue=revenue_decimal,
        order_count=orders,
        average_order_value=revenue_decimal / orders if orders else Decimal("0"),
        payment_success_rate=(Decimal(succeeded) / Decimal(total)) if total else Decimal("0"),
        refund_amount=refund_decimal,
        pending_settlement=Decimal(pending),
        expenses=expense_decimal,
        net_cash_flow=revenue_decimal - refund_decimal - expense_decimal,
    )
