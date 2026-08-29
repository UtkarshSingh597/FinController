from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AlertItem(BaseModel):
    id: UUID
    severity: str
    title: str
    body: str
    read_at: datetime | None
    created_at: datetime


class AlertActionResponse(BaseModel):
    success: bool
    alert_id: UUID
    status: str
    message: str
