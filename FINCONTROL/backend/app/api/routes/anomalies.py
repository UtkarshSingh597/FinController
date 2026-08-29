from datetime import UTC, datetime, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.deps import Principal, get_current_principal
from app.db.session import get_db_session
from app.ml.anomaly import detect_payment_amount_anomalies
from app.models.financial import Anomaly, Payment, Severity
from app.schemas.anomalies import AnomalyItem

router = APIRouter(prefix="/anomalies", tags=["anomalies"])


@router.get("", response_model=list[AnomalyItem])
def get_anomalies(
    principal: Principal = Depends(get_current_principal),
    session: Session = Depends(get_db_session),
) -> list[AnomalyItem]:
    existing = list(
        session.scalars(
            select(Anomaly)
            .where(Anomaly.organization_id == principal.organization_id)
            .order_by(desc(Anomaly.detected_at))
            .limit(50)
        ).all()
    )

    if not existing:
        now = datetime.now(UTC)
        payments = list(
            session.scalars(
                select(Payment)
                .where(
                    Payment.organization_id == principal.organization_id,
                    Payment.occurred_at >= now - timedelta(days=30),
                )
                .order_by(Payment.occurred_at.asc())
            ).all()
        )
        amounts = [p.amount for p in payments if p.amount is not None]
        if len(amounts) >= 8:
            try:
                results = detect_payment_amount_anomalies(amounts)
                for payment, res in zip(payments, results, strict=True):
                    if res.is_anomaly:
                        severity = (
                            Severity.CRITICAL
                            if res.anomaly_score > Decimal("0.85")
                            else Severity.HIGH
                            if res.anomaly_score > Decimal("0.70")
                            else Severity.MODERATE
                        )
                        anomaly = Anomaly(
                            organization_id=principal.organization_id,
                            entity_type="payment",
                            entity_id=payment.id,
                            anomaly_score=res.anomaly_score,
                            severity=severity,
                            explanation_features=res.explanation_features,
                            detected_at=payment.occurred_at,
                        )
                        session.add(anomaly)
                        existing.append(anomaly)
                session.flush()
                session.commit()
            except ValueError:
                pass

    return [
        AnomalyItem(
            id=a.id,
            entity_type=a.entity_type,
            entity_id=a.entity_id,
            anomaly_score=a.anomaly_score,
            severity=a.severity.value if hasattr(a.severity, "value") else str(a.severity),
            explanation_features=a.explanation_features,
            detected_at=a.detected_at,
        )
        for a in existing
    ]
