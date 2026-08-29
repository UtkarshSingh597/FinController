from decimal import Decimal

from app.services.simulation import simulate_revenue_change


def test_simulation_is_read_only_math() -> None:
    result = simulate_revenue_change(
        baseline_revenue=Decimal("1000"), percent_change=Decimal("-15")
    )
    assert result.projected_revenue == Decimal("850.00")
    assert result.impact == Decimal("-150.00")
