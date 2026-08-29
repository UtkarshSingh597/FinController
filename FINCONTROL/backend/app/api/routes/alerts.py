from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, get_current_user, get_db
from app.models.financial import Alert
from app.schemas.alerts import AlertActionResponse, AlertItem

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertItem])
def list_alerts(
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> list[AlertItem]:
    """List operational and anomaly alerts for authenticated tenant."""
    alerts = list(
        session.scalars(
            select(Alert)
            .where(Alert.organization_id == current_user.organization_id)
            .order_by(desc(Alert.created_at))
            .limit(100)
        ).all()
    )
    return [
        AlertItem(
            id=a.id,
            severity=a.severity.value if hasattr(a.severity, "value") else str(a.severity),
            title=a.title,
            body=a.body,
            read_at=a.read_at,
            created_at=a.created_at,
        )
        for a in alerts
    ]


@router.patch("/{alert_id}/read", response_model=AlertActionResponse)
def mark_alert_read(
    alert_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> AlertActionResponse:
    """Mark an alert as read / acknowledged."""
    alert = session.scalar(
        select(Alert).where(
            Alert.organization_id == current_user.organization_id,
            Alert.id == alert_id,
        )
    )
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found.")

    if not alert.read_at:
        alert.read_at = datetime.now(UTC)
        session.commit()

    return AlertActionResponse(
        success=True,
        alert_id=alert_id,
        status="read",
        message="Alert acknowledged.",
    )


@router.post("/{alert_id}/resolve", response_model=AlertActionResponse)
def resolve_alert(
    alert_id: UUID,
    current_user: CurrentUser = Depends(get_current_user),
    session: Session = Depends(get_db),
) -> AlertActionResponse:
    """Mark an alert as resolved."""
    alert = session.scalar(
        select(Alert).where(
            Alert.organization_id == current_user.organization_id,
            Alert.id == alert_id,
        )
    )
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found.")

    alert.read_at = datetime.now(UTC)
    session.commit()

    return AlertActionResponse(
        success=True,
        alert_id=alert_id,
        status="resolved",
        message="Alert marked as resolved.",
    )
