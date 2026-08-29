from dataclasses import dataclass
from decimal import Decimal
from typing import Any


@dataclass(frozen=True)
class RiskAssessmentResult:
    risk_score: Decimal
    risk_level: str  # "minimal" | "low" | "moderate" | "high" | "critical"
    trend: str
    risk_drivers: list[str]
    model_name: str
    model_version: str
    confidence: float
    explanation: dict[str, Any]


def evaluate_financial_risk(
    *,
    revenue: Decimal,
    refund_amount: Decimal,
    payment_success_rate: Decimal,
    net_cash_flow: Decimal,
) -> RiskAssessmentResult:
    """Deterministic financial stability & risk scoring ML model."""
    risk_points = 0
    drivers = []

    # Check payment reliability
    if payment_success_rate < Decimal("0.90"):
        risk_points += 40
        drivers.append(
            f"Severe payment degradation: success rate at {payment_success_rate * 100:.1f}%"
        )
    elif payment_success_rate < Decimal("0.95"):
        risk_points += 20
        drivers.append(
            f"Moderate payment decline: success rate at {payment_success_rate * 100:.1f}%"
        )

    # Check refund ratio
    if revenue > Decimal("0"):
        refund_ratio = refund_amount / revenue
        if refund_ratio > Decimal("0.10"):
            risk_points += 30
            drivers.append(f"Elevated refund ratio: {refund_ratio * 100:.1f}% of revenue")
        elif refund_ratio > Decimal("0.05"):
            risk_points += 15
            drivers.append(f"Mild refund pressure: {refund_ratio * 100:.1f}% of revenue")

    # Check cash flow health
    if net_cash_flow < Decimal("0"):
        risk_points += 30
        drivers.append("Negative operational net cash flow")

    score_dec = Decimal(str(min(100, max(0, risk_points)))) / Decimal("100")

    if score_dec >= Decimal("0.70"):
        level = "critical"
    elif score_dec >= Decimal("0.50"):
        level = "high"
    elif score_dec >= Decimal("0.25"):
        level = "moderate"
    elif score_dec >= Decimal("0.10"):
        level = "low"
    else:
        level = "minimal"

    return RiskAssessmentResult(
        risk_score=score_dec,
        risk_level=level,
        trend="worsening" if risk_points >= 40 else "stable",
        risk_drivers=drivers or ["All monitored indicators within nominal bounds"],
        model_name="FinancialRiskModel",
        model_version="1.0",
        confidence=0.92,
        explanation={
            "payment_success_rate": float(payment_success_rate),
            "refund_ratio": (
                float(round(refund_amount / revenue, 4)) if revenue > 0 else 0.0
            ),
            "net_cash_flow": float(net_cash_flow),
            "risk_points": risk_points,
        },
    )
