from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any


@dataclass(frozen=True)
class SimulationResult:
    baseline_revenue: Decimal
    projected_revenue: Decimal
    impact: Decimal
    assumption: str
    scenario_details: dict[str, Any] = field(default_factory=dict)
    classification: str = "SIMULATION"


def simulate_revenue_change(
    *, baseline_revenue: Decimal | float, percent_change: Decimal | float
) -> SimulationResult:
    """Read-only deterministic scenario calculation; never writes financial records."""
    base_dec = Decimal(str(baseline_revenue))
    pct_dec = Decimal(str(percent_change))
    projected = base_dec * (Decimal("1") + pct_dec / Decimal("100"))
    return SimulationResult(
        baseline_revenue=base_dec,
        projected_revenue=projected,
        impact=projected - base_dec,
        assumption=f"Revenue variation of {pct_dec}%",
        scenario_details={"revenue_percent_change": float(pct_dec)},
    )


def simulate_scenario(
    *,
    baseline_revenue: Decimal | float,
    percent_change: Decimal | float = Decimal("0"),
    payment_failure_change: Decimal | float | None = None,
    refund_change: Decimal | float | None = None,
    delay_days: int | None = None,
) -> SimulationResult:
    """Multi-variable read-only financial simulation engine."""
    base_dec = Decimal(str(baseline_revenue))
    pct_dec = Decimal(str(percent_change))
    rev_factor = Decimal("1") + (pct_dec / Decimal("100"))
    projected_rev = base_dec * rev_factor

    # Payment failure impact estimation
    loss_from_failures = Decimal("0")
    if payment_failure_change is not None and payment_failure_change != 0:
        pf_dec = Decimal(str(payment_failure_change))
        loss_from_failures = projected_rev * (pf_dec / Decimal("100"))
        projected_rev = max(Decimal("0"), projected_rev - loss_from_failures)

    # Refund impact estimation
    refund_impact = Decimal("0")
    if refund_change is not None and refund_change != 0:
        ref_dec = Decimal(str(refund_change))
        refund_impact = projected_rev * (ref_dec / Decimal("100")) * Decimal("0.05")

    impact = projected_rev - base_dec

    assumptions = []
    if pct_dec != Decimal("0"):
        assumptions.append(f"Revenue change: {pct_dec:+.1f}%")
    if payment_failure_change:
        assumptions.append(f"Payment failure change: {float(payment_failure_change):+.1f}%")
    if refund_change:
        assumptions.append(f"Refund volume change: {float(refund_change):+.1f}%")
    if delay_days:
        assumptions.append(f"Settlement delay: +{delay_days} days")

    assumption_str = "; ".join(assumptions) if assumptions else "Baseline scenario (no change)"

    return SimulationResult(
        baseline_revenue=base_dec,
        projected_revenue=projected_rev,
        impact=impact,
        assumption=assumption_str,
        scenario_details={
            "revenue_percent_change": float(pct_dec),
            "payment_failure_change": (
                float(payment_failure_change) if payment_failure_change else 0.0
            ),
            "refund_change": float(refund_change) if refund_change else 0.0,
            "delay_days": delay_days or 0,
            "failure_loss_amount": float(loss_from_failures),
            "refund_delta_amount": float(refund_impact),
        },
    )
