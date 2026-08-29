from datetime import UTC, datetime, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import Principal, get_current_principal
from app.db.session import get_db_session
from app.schemas.simulations import SimulationRequest, SimulationResponse
from app.services.financial_metrics import financial_summary
from app.services.simulation import simulate_scenario

router = APIRouter(prefix="/simulations", tags=["simulations"])


@router.post("/revenue", response_model=SimulationResponse)
def run_revenue_simulation(
    body: SimulationRequest,
    principal: Principal = Depends(get_current_principal),
    session: Session = Depends(get_db_session),
) -> SimulationResponse:
    now = datetime.now(UTC)
    summary = financial_summary(
        session,
        organization_id=principal.organization_id,
        period_start=now - timedelta(days=30),
        period_end=now,
    )
    baseline = summary.revenue if summary.revenue > Decimal("0") else Decimal("10000.00")
    result = simulate_scenario(
        baseline_revenue=baseline,
        percent_change=body.percent_change,
        payment_failure_change=body.payment_failure_change,
        refund_change=body.refund_change,
        delay_days=body.delay_days,
    )
    return SimulationResponse(
        baseline_revenue=result.baseline_revenue,
        projected_revenue=result.projected_revenue,
        impact=result.impact,
        assumption=result.assumption,
        scenario_details=result.scenario_details,
        classification=result.classification,
    )
