"""Deterministic Multi-Factor Financial Stability and Risk Assessment Engine."""

from dataclasses import dataclass
from typing import Dict

@dataclass(frozen=True)
class RiskAssessment:
    overall_risk_score: float  # 0.0 (Safe) - 1.0 (Critical Risk)
    risk_tier: str            # LOW, MEDIUM, HIGH, CRITICAL
    sub_scores: Dict[str, float]
    primary_risk_driver: str

def evaluate_financial_stability(
    decline_rate_pct: float,
    refund_ratio_pct: float,
    gateway_timeout_pct: float,
    cash_burn_multiple: float = 1.0,
) -> RiskAssessment:
    """Evaluate financial health across payment reliability, dispute risk, and gateway degradation."""
    decline_score = min(decline_rate_pct / 25.0, 1.0)
    refund_score = min(refund_ratio_pct / 10.0, 1.0)
    timeout_score = min(gateway_timeout_pct / 5.0, 1.0)
    burn_score = min(cash_burn_multiple / 3.0, 1.0)

    # Weighted aggregate
    overall = (
        0.35 * decline_score +
        0.25 * timeout_score +
        0.25 * refund_score +
        0.15 * burn_score
    )

    if overall >= 0.75:
        tier = "CRITICAL"
    elif overall >= 0.50:
        tier = "HIGH"
    elif overall >= 0.25:
        tier = "MEDIUM"
    else:
        tier = "LOW"

    drivers = {
        "Payment Declines": decline_score,
        "Gateway Timeouts": timeout_score,
        "Refund Velocity": refund_score,
        "Cash Burn": burn_score,
    }
    primary_driver = max(drivers.items(), key=lambda x: x[1])[0]

    return RiskAssessment(
        overall_risk_score=round(overall, 3),
        risk_tier=tier,
        sub_scores={k: round(v, 3) for k, v in drivers.items()},
        primary_risk_driver=primary_driver,
    )
