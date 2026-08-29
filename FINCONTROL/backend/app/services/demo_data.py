"""Reproducible demo data for financial investigations; never used for production data."""

import random
import uuid
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.financial import (
    Alert,
    Anomaly,
    Customer,
    Expense,
    Order,
    OrderStatus,
    Payment,
    PaymentStatus,
    Refund,
    Settlement,
    SettlementStatus,
    Severity,
)


def generate_demo_data(
    session: Session,
    *,
    organization_id: uuid.UUID,
    seed: int = 20260823,
    scenario: str = "payment_failure_spike",
    days: int = 30,
) -> None:
    """Generate deterministic, rich synthetic financial telemetry across all financial domains."""
    rng = random.Random(seed)
    now = datetime.now(UTC).replace(hour=12, minute=0, second=0, microsecond=0)
    customers = [
        Customer(
            organization_id=organization_id, email=f"demo-{index}@example.test", segment="demo"
        )
        for index in range(24)
    ]
    session.add_all(customers)
    session.flush()
    successful_payments: list[Payment] = []
    failed_payments: list[Payment] = []

    for day in range(days):
        occurred_at = now - timedelta(days=days - day)
        failure_rate = 0.06
        if scenario == "payment_failure_spike" and day >= days - 3:
            failure_rate = 0.38
        for sequence in range(12):
            amount = Decimal(rng.randrange(2500, 15000)) / 100
            customer = customers[(day * 12 + sequence) % len(customers)]
            failed = rng.random() < failure_rate
            order = Order(
                organization_id=organization_id,
                customer_id=customer.id,
                external_id=f"demo-{day}-{sequence}",
                amount=amount,
                currency="USD",
                status=OrderStatus.PENDING if failed else OrderStatus.PAID,
                occurred_at=occurred_at,
            )
            session.add(order)
            session.flush()
            payment = Payment(
                organization_id=organization_id,
                order_id=order.id,
                provider="demo-pay",
                method="card",
                amount=amount,
                fee_amount=amount * Decimal("0.029"),
                currency="USD",
                status=PaymentStatus.FAILED if failed else PaymentStatus.SUCCEEDED,
                failure_reason="provider_timeout" if failed else None,
                occurred_at=occurred_at,
            )
            session.add(payment)
            if not failed:
                successful_payments.append(payment)
            else:
                failed_payments.append(payment)

        # Multi-category operating expenses
        session.add(
            Expense(
                organization_id=organization_id,
                category="operations",
                amount=Decimal("180.00"),
                currency="USD",
                occurred_at=occurred_at,
            )
        )
        session.add(
            Expense(
                organization_id=organization_id,
                category="cloud_infrastructure",
                amount=Decimal("140.00"),
                currency="USD",
                occurred_at=occurred_at,
            )
        )
    session.flush()

    # Refunds with specific categorization
    refund_reasons = ["defective_item", "duplicate_charge", "demo_return", "buyer_remorse"]
    for i, payment in enumerate(successful_payments[:8]):
        session.add(
            Refund(
                organization_id=organization_id,
                payment_id=payment.id,
                amount=payment.amount * Decimal("0.25"),
                reason=refund_reasons[i % len(refund_reasons)],
                occurred_at=payment.occurred_at + timedelta(days=1),
            )
        )

    # Multi-batch Settlements (Paid, Pending, Delayed)
    settle_expected = sum(
        (payment.amount for payment in successful_payments), Decimal("0")
    )
    # Batch 1: In-transit pending batch
    session.add(
        Settlement(
            organization_id=organization_id,
            provider="demo-pay",
            expected_amount=settle_expected * Decimal("0.60"),
            actual_amount=None,
            currency="USD",
            status=SettlementStatus.PENDING,
            expected_at=now + timedelta(days=2),
        )
    )
    # Batch 2: Delayed settlement batch exceeding T+2 transit window
    session.add(
        Settlement(
            organization_id=organization_id,
            provider="demo-pay",
            expected_amount=Decimal("29800.00"),
            actual_amount=None,
            currency="USD",
            status=SettlementStatus.DELAYED,
            expected_at=now - timedelta(days=2),
        )
    )
    # Batch 3: Completed historical payout
    session.add(
        Settlement(
            organization_id=organization_id,
            provider="demo-pay",
            expected_amount=Decimal("42100.00"),
            actual_amount=Decimal("42100.00"),
            currency="USD",
            status=SettlementStatus.PAID,
            expected_at=now - timedelta(days=5),
            settled_at=now - timedelta(days=5),
        )
    )

    # Seed Sample Outlier Anomalies and Alerts
    if failed_payments:
        sample_fail = failed_payments[-1]
        anom = Anomaly(
            organization_id=organization_id,
            entity_type="payment",
            entity_id=sample_fail.id,
            anomaly_score=Decimal("0.91240"),
            severity=Severity.CRITICAL,
            explanation_features={
                "payment_amount": float(sample_fail.amount),
                "failure_reason": "provider_timeout",
                "timeout_duration_ms": 12400,
            },
            detected_at=sample_fail.occurred_at,
        )
        session.add(anom)
        session.flush()

        session.add(
            Alert(
                organization_id=organization_id,
                anomaly_id=anom.id,
                severity=Severity.CRITICAL,
                title="Payment Provider Timeout Surge",
                body=(
                    "Card processor demo-pay error rate reached 38% over the last 3 days."
                ),
            )
        )
    session.flush()
