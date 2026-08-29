from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import uuid4

from app.mcp.contracts import (
    ToolContext,
    detect_anomalies_mcp,
    get_financial_summary,
    get_payment_breakdown_mcp,
    get_settlement_reconciliation_mcp,
    run_scenario_mcp,
)


def test_mcp_summary_requires_trusted_context(client) -> None:
    override = next(iter(client.app.dependency_overrides.values()))
    generator = override()
    session = next(generator)
    context = ToolContext(organization_id=uuid4(), user_id=uuid4())
    result = get_financial_summary(
        session,
        context=context,
        period_start=datetime.now(UTC) - timedelta(days=1),
        period_end=datetime.now(UTC),
    )
    assert result.revenue == 0
    generator.close()


def test_mcp_payment_and_settlement_contracts(client) -> None:
    override = next(iter(client.app.dependency_overrides.values()))
    generator = override()
    session = next(generator)
    context = ToolContext(organization_id=uuid4(), user_id=uuid4())

    now = datetime.now(UTC)
    payments = get_payment_breakdown_mcp(
        session,
        context=context,
        period_start=now - timedelta(days=7),
        period_end=now,
    )
    assert payments["total_payments"] == 0

    settlements = get_settlement_reconciliation_mcp(session, context=context)
    assert settlements == []

    anomalies = detect_anomalies_mcp(session, context=context, period_start=now - timedelta(days=7))
    assert anomalies == []

    simulation = run_scenario_mcp(
        baseline_revenue=Decimal("50000"),
        percent_change=Decimal("-10"),
    )
    assert simulation.projected_revenue == Decimal("45000.00")
    assert simulation.impact == Decimal("-5000.00")

    generator.close()
