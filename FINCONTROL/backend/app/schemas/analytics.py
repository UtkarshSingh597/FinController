from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class FinancialSummary(BaseModel):
    period_start: datetime
    period_end: datetime
    revenue: Decimal
    order_count: int
    average_order_value: Decimal
    payment_success_rate: Decimal
    refund_amount: Decimal
    pending_settlement: Decimal
    expenses: Decimal
    net_cash_flow: Decimal
