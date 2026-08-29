from datetime import UTC, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.financial import (
    Customer,
    Order,
    OrderStatus,
    Payment,
    PaymentAttempt,
    PaymentStatus,
    Refund,
    Settlement,
    SettlementStatus,
)
from app.models.identity import Organization
from app.schemas.ingestion import WebhookResponse

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def _resolve_target_org(session: Session, org_id_header: str | None) -> UUID:
    """Resolve target organization from webhook header or first available organization."""
    if org_id_header:
        try:
            return UUID(org_id_header)
        except ValueError:
            pass
    org = session.scalar(select(Organization).limit(1))
    if not org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No organization configured to receive webhook.",
        )
    return org.id


def _get_or_create_customer(session: Session, org_id: UUID, email: str) -> Customer:
    customer = session.scalar(
        select(Customer).where(Customer.organization_id == org_id, Customer.email == email)
    )
    if not customer:
        customer = Customer(
            organization_id=org_id,
            email=email,
            external_id=f"cust_{uuid4().hex[:8]}",
            segment="standard",
        )
        session.add(customer)
        session.flush()
    return customer


@router.post("/stripe", response_model=WebhookResponse)
def handle_stripe_webhook(
    payload: dict[str, Any],
    session: Session = Depends(get_db),
    x_organization_id: str | None = Header(default=None, alias="X-Organization-ID"),
) -> WebhookResponse:
    """Ingest Stripe webhook events into tenant financial records."""
    org_id = _resolve_target_org(session, x_organization_id)
    event_id = payload.get("id", f"evt_{uuid4().hex[:12]}")
    event_type = payload.get("type", "payment_intent.succeeded")
    data_obj = payload.get("data", {}).get("object", {})

    now = datetime.now(UTC)
    entity_created = None

    if event_type in ("payment_intent.succeeded", "charge.succeeded"):
        amount_cents = data_obj.get("amount", 25000)
        currency = data_obj.get("currency", "usd").upper()
        amount = Decimal(str(amount_cents)) / Decimal("100")
        fee = Decimal(str(round(float(amount) * 0.029 + 0.30, 2)))
        cust_email = data_obj.get("receipt_email") or "customer@stripe-webhook.com"

        customer = _get_or_create_customer(session, org_id, cust_email)

        order = Order(
            organization_id=org_id,
            customer_id=customer.id,
            external_id=f"ord_stripe_{uuid4().hex[:8]}",
            amount=amount,
            currency=currency,
            status=OrderStatus.PAID,
            occurred_at=now,
        )
        session.add(order)
        session.flush()

        payment = Payment(
            organization_id=org_id,
            order_id=order.id,
            provider="Stripe",
            method=data_obj.get("payment_method_types", ["card"])[0],
            amount=amount,
            fee_amount=fee,
            currency=currency,
            status=PaymentStatus.SUCCEEDED,
            occurred_at=now,
        )
        session.add(payment)
        session.flush()

        attempt = PaymentAttempt(
            organization_id=org_id,
            payment_id=payment.id,
            attempt_number=1,
            status=PaymentStatus.SUCCEEDED,
            occurred_at=now,
        )
        session.add(attempt)
        session.commit()
        entity_created = f"Payment({payment.id})"

    elif event_type == "payment_intent.payment_failed":
        amount_cents = data_obj.get("amount", 18500)
        currency = data_obj.get("currency", "usd").upper()
        amount = Decimal(str(amount_cents)) / Decimal("100")
        reason = data_obj.get("last_payment_error", {}).get("message", "provider_timeout")

        customer = _get_or_create_customer(
            session, org_id, "failed_checkout@stripe.com"
        )
        order = Order(
            organization_id=org_id,
            customer_id=customer.id,
            external_id=f"ord_fail_{uuid4().hex[:8]}",
            amount=amount,
            currency=currency,
            status=OrderStatus.PENDING,
            occurred_at=now,
        )
        session.add(order)
        session.flush()

        payment = Payment(
            organization_id=org_id,
            order_id=order.id,
            provider="Stripe",
            method="card",
            amount=amount,
            fee_amount=Decimal("0.0"),
            currency=currency,
            status=PaymentStatus.FAILED,
            failure_reason=reason[:150],
            occurred_at=now,
        )
        session.add(payment)
        session.flush()

        attempt = PaymentAttempt(
            organization_id=org_id,
            payment_id=payment.id,
            attempt_number=1,
            status=PaymentStatus.FAILED,
            failure_reason=reason[:150],
            occurred_at=now,
        )
        session.add(attempt)
        session.commit()
        entity_created = f"FailedPayment({payment.id})"

    elif event_type in ("charge.refunded", "refund.created"):
        amount_cents = data_obj.get("amount_refunded", 5000)
        amount = Decimal(str(amount_cents)) / Decimal("100")
        latest_payment = session.scalar(
            select(Payment)
            .where(Payment.organization_id == org_id, Payment.status == PaymentStatus.SUCCEEDED)
            .order_by(Payment.created_at.desc())
            .limit(1)
        )
        if latest_payment:
            refund = Refund(
                organization_id=org_id,
                payment_id=latest_payment.id,
                amount=amount,
                reason="Stripe chargeback / customer requested return",
                occurred_at=now,
            )
            session.add(refund)
            session.commit()
            entity_created = f"Refund({refund.id})"

    return WebhookResponse(
        received=True,
        event_id=str(event_id),
        event_type=event_type,
        entity_created=entity_created,
        message=f"Stripe event {event_type} successfully ingested into ledger.",
    )


@router.post("/adyen", response_model=WebhookResponse)
def handle_adyen_webhook(
    payload: dict[str, Any],
    session: Session = Depends(get_db),
    x_organization_id: str | None = Header(default=None, alias="X-Organization-ID"),
) -> WebhookResponse:
    """Ingest Adyen settlement and capture notifications."""
    org_id = _resolve_target_org(session, x_organization_id)
    event_code = payload.get("eventCode", "PAYOUT")
    now = datetime.now(UTC)
    entity_created = None

    if event_code in ("PAYOUT", "SETTLEMENT", "REPORT_AVAILABLE"):
        amount_val = Decimal(str(payload.get("amount", 12500.00)))
        settlement = Settlement(
            organization_id=org_id,
            provider="Adyen",
            expected_amount=amount_val,
            actual_amount=amount_val,
            currency="USD",
            status=SettlementStatus.PAID,
            expected_at=now,
            settled_at=now,
        )
        session.add(settlement)
        session.commit()
        entity_created = f"Settlement({settlement.id})"

    return WebhookResponse(
        received=True,
        event_id=payload.get("pspReference", f"adyen_{uuid4().hex[:10]}"),
        event_type=event_code,
        entity_created=entity_created,
        message=f"Adyen notification {event_code} processed.",
    )
