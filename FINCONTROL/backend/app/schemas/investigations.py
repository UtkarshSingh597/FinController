import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class InvestigationCreate(BaseModel):
    question: str = Field(..., min_length=3, max_length=1000)


class InvestigationResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    user_id: uuid.UUID
    question: str
    status: str
    evidence: list[dict[str, Any]]
    conclusion: dict[str, Any] | None
    created_at: datetime
    completed_at: datetime | None


class InvestigationListItem(BaseModel):
    id: uuid.UUID
    question: str
    status: str
    created_at: datetime
    completed_at: datetime | None
    skills_used: list[str] = Field(default_factory=list)
