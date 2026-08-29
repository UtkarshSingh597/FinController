from datetime import UTC, datetime, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.financial import Customer, Expense, Order, OrderStatus
from app.models.identity import Organization
from app.services.financial_metrics import financial_summary


def test_financial_summary_is_tenant_scoped(client) -> None:
    override = next(iter(client.app.dependency_overrides.values()))
    generator = override()
    session: Session = next(generator)
    first, second = (
        Organization(name="First", slug="first"),
        Organization(name="Second", slug="second"),
    )
    session.add_all([first, second])
    session.flush()
    customer = Customer(organization_id=first.id, email="customer@example.test")
    session.add(customer)
    session.flush()
    now = datetime.now(UTC)
    session.add_all([
        Order(
            organization_id=first.id,
            customer_id=customer.id,
            external_id="one",
            amount=Decimal("100"),
            currency="USD",
            status=OrderStatus.PAID,
            occurred_at=now,
        ),
        Expense(
            organization_id=first.id,
            category="ops",
            amount=Decimal("30"),
            currency="USD",
            occurred_at=now,
        ),
    ])
    session.commit()
    result = financial_summary(
        session,
        organization_id=first.id,
        period_start=now - timedelta(days=1),
        period_end=now + timedelta(days=1),
    )
    other = financial_summary(
        session,
        organization_id=second.id,
        period_start=now - timedelta(days=1),
        period_end=now + timedelta(days=1),
    )
    assert result.revenue == Decimal("100")
    assert result.net_cash_flow == Decimal("70")
    assert other.revenue == Decimal("0")
    generator.close()
