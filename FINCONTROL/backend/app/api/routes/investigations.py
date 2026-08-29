import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import Principal, get_current_principal
from app.db.session import get_db_session
from app.schemas.investigations import (
    InvestigationCreate,
    InvestigationListItem,
    InvestigationResponse,
)
from app.services.investigations import (
    execute_investigation,
    get_investigation_by_id,
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
