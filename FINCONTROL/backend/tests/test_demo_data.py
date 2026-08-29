from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.financial import Payment, PaymentStatus
from app.models.identity import Organization
from app.services.demo_data import generate_demo_data


def test_demo_generator_creates_reproducible_payment_failure_spike(client) -> None:
    override = next(iter(client.app.dependency_overrides.values()))
    generator = override()
    session: Session = next(generator)
    organization = Organization(name="Demo", slug="demo")
    session.add(organization)
    session.flush()

    generate_demo_data(session, organization_id=organization.id, days=10)
    session.commit()
    failed = session.scalar(
        select(func.count()).select_from(Payment).where(Payment.status == PaymentStatus.FAILED)
    )
    succeeded = session.scalar(
        select(func.count()).select_from(Payment).where(Payment.status == PaymentStatus.SUCCEEDED)
    )

    assert failed is not None and failed > 0
    assert succeeded is not None and succeeded > failed
    generator.close()
