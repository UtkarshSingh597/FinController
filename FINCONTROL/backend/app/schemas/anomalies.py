import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel


class AnomalyItem(BaseModel):
    id: uuid.UUID
    entity_type: str
    entity_id: uuid.UUID | None
    anomaly_score: Decimal
    severity: str
    explanation_features: dict[str, Any]
    detected_at: datetime
