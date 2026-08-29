from decimal import Decimal
from typing import Any

from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    percent_change: Decimal = Field(..., ge=Decimal("-100"), le=Decimal("500"))
    payment_failure_change: Decimal | None = Field(
        default=None, ge=Decimal("-100"), le=Decimal("500")
    )
    refund_change: Decimal | None = Field(
        default=None, ge=Decimal("-100"), le=Decimal("500")
    )
    delay_days: int | None = Field(default=None, ge=0, le=90)


class SimulationResponse(BaseModel):
    baseline_revenue: Decimal
    projected_revenue: Decimal
    impact: Decimal
    assumption: str
    scenario_details: dict[str, Any] = Field(default_factory=dict)
    classification: str = "SIMULATION"
