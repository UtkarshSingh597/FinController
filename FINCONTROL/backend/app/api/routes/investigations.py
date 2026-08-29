import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import Principal, get_current_principal
from app.db.session import get_db_session
from app.schemas.investigations import (
    InvestigationCreate,
    InvestigationFollowUpCreate,
    InvestigationListItem,
    InvestigationResponse,
)
from app.services.investigations import (
    execute_investigation,
    export_investigation_report,
    get_investigation_by_id,
    investigate_followup,
    list_investigations,
)

router = APIRouter(prefix="/investigations", tags=["investigations"])


@router.post("", response_model=InvestigationResponse, status_code=status.HTTP_201_CREATED)
def create_investigation(
    body: InvestigationCreate,
    principal: Principal = Depends(get_current_principal),
    session: Session = Depends(get_db_session),
) -> InvestigationResponse:
    investigation = execute_investigation(
        session,
        organization_id=principal.organization_id,
        user_id=principal.user_id,
        question=body.question,
    )
    session.commit()
    return InvestigationResponse(
        id=investigation.id,
        organization_id=investigation.organization_id,
        user_id=investigation.user_id,
        question=investigation.question,
        status=investigation.status,
        evidence=investigation.evidence,
        conclusion=investigation.conclusion,
        created_at=investigation.created_at,
        completed_at=investigation.completed_at,
    )


@router.post("/{investigation_id}/follow-up", response_model=InvestigationResponse)
def submit_investigation_followup(
    investigation_id: uuid.UUID,
    body: InvestigationFollowUpCreate,
    principal: Principal = Depends(get_current_principal),
    session: Session = Depends(get_db_session),
) -> InvestigationResponse:
    try:
        investigation = investigate_followup(
            session,
            investigation_id=investigation_id,
            organization_id=principal.organization_id,
            user_id=principal.user_id,
            followup_question=body.followup_question,
        )
        session.commit()
        return InvestigationResponse(
            id=investigation.id,
            organization_id=investigation.organization_id,
            user_id=investigation.user_id,
            question=investigation.question,
            status=investigation.status,
            evidence=investigation.evidence,
            conclusion=investigation.conclusion,
            created_at=investigation.created_at,
            completed_at=investigation.completed_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


@router.get("/{investigation_id}/export")
def export_investigation(
    investigation_id: uuid.UUID,
    format: str = Query(default="json", pattern="^(json|csv|markdown|md)$"),
    principal: Principal = Depends(get_current_principal),
    session: Session = Depends(get_db_session),
):
    record = get_investigation_by_id(
        session,
        organization_id=principal.organization_id,
        investigation_id=investigation_id,
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investigation not found.",
        )

    content, filename = export_investigation_report(record, export_format=format)
    media_type = "application/json"
    if format == "csv":
        media_type = "text/csv"
    elif format in ("markdown", "md"):
        media_type = "text/markdown"

    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("", response_model=list[InvestigationListItem])
def get_investigations(
    principal: Principal = Depends(get_current_principal),
    session: Session = Depends(get_db_session),
) -> list[InvestigationListItem]:
    records = list_investigations(session, organization_id=principal.organization_id)
    return [
        InvestigationListItem(
            id=rec.id,
            question=rec.question,
            status=rec.status,
            created_at=rec.created_at,
            completed_at=rec.completed_at,
            skills_used=(
                rec.conclusion.get("skills", [])
                if isinstance(rec.conclusion, dict)
                else []
            ),
        )
        for rec in records
    ]


@router.get("/{investigation_id}", response_model=InvestigationResponse)
def get_investigation(
    investigation_id: uuid.UUID,
    principal: Principal = Depends(get_current_principal),
    session: Session = Depends(get_db_session),
) -> InvestigationResponse:
    record = get_investigation_by_id(
        session,
        organization_id=principal.organization_id,
        investigation_id=investigation_id,
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investigation not found.",
        )
    return InvestigationResponse(
        id=record.id,
        organization_id=record.organization_id,
        user_id=record.user_id,
        question=record.question,
        status=record.status,
        evidence=record.evidence,
        conclusion=record.conclusion,
        created_at=record.created_at,
        completed_at=record.completed_at,
    )
