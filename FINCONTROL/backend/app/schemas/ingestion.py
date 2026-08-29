from pydantic import BaseModel, Field


class WebhookResponse(BaseModel):
    received: bool = True
    event_id: str
    event_type: str
    entity_created: str | None = None
    message: str


class CSVIngestionRow(BaseModel):
    date: str
    amount: float
    type: str  # order, payment, expense, settlement, refund
    description: str
    currency: str = "USD"
    provider: str | None = "manual_csv"
    category: str | None = "general"


class CSVIngestionRequest(BaseModel):
    rows: list[CSVIngestionRow] = Field(..., min_length=1)


class CSVIngestionResponse(BaseModel):
    success: bool
    total_processed: int
    orders_created: int
    payments_created: int
    expenses_created: int
    refunds_created: int
    settlements_created: int
    errors: list[str] = Field(default_factory=list)
