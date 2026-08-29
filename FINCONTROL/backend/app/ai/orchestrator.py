from dataclasses import dataclass
from enum import StrEnum


class Skill(StrEnum):
    FINANCIAL_ANALYSIS = "financial_analysis"
    REVENUE_INVESTIGATION = "revenue_investigation"
    PAYMENT_ANALYSIS = "payment_analysis"
    ANOMALY_INVESTIGATION = "anomaly_investigation"
    SETTLEMENT_ANALYSIS = "settlement_analysis"
    REVENUE_LEAKAGE = "revenue_leakage"
    CASHFLOW_ANALYSIS = "cashflow_analysis"
    RISK_ASSESSMENT = "risk_assessment"
    SCENARIO_SIMULATION = "scenario_simulation"


@dataclass(frozen=True)
class InvestigationPlan:
    skills: tuple[Skill, ...]
    primary_skill: Skill
    requires_summary: bool
    requires_anomaly_model: bool


def plan_investigation(question: str) -> InvestigationPlan:
    """Deterministic, query-aware routing mapping financial questions to specialized skills."""
    text = question.lower()
    skills: list[Skill] = []

    # 1. Scenario Simulation (Highest Specificity for Hypotheticals)
    if any(
        term in text
        for term in (
            "what if",
            "scenario",
            "would happen",
            "happens if",
            "falls 15%",
            "decreases by",
            "simulate",
            "stress test",
            "project",
        )
    ):
        skills.append(Skill.SCENARIO_SIMULATION)

    # 2. Anomalies & Outliers (High Specificity)
    if any(
        term in text
        for term in (
            "unusual",
            "anomal",
            "outlier",
            "spike",
            "irregular",
            "suspicious",
            "which payment",
            "which transaction",
        )
    ):
        skills.append(Skill.ANOMALY_INVESTIGATION)

    # 3. Settlement Analysis (High Specificity)
    if any(
        term in text
        for term in (
            "settlement",
            "payout",
            "transit",
            "delay",
            "delayed",
            "bank transfer",
            "funds arrived",
            "cash arrived",
        )
    ):
        skills.append(Skill.SETTLEMENT_ANALYSIS)

    # 4. Refunds & Revenue Leakage (High Specificity)
    if any(
        term in text
        for term in (
            "refund",
            "chargeback",
            "return",
            "returned",
            "leakage",
            "reconcile",
            "mismatch",
            "lost money",
            "discrepanc",
        )
    ):
        skills.append(Skill.REVENUE_LEAKAGE)

    # 5. Cash Flow & Liquidity (High Specificity)
    if any(
        term in text
        for term in (
            "cash flow",
            "liquidity",
            "runway",
            "burn",
            "deteriorat",
            "expense",
            "operating cost",
            "outflow",
        )
    ):
        skills.append(Skill.CASHFLOW_ANALYSIS)

    # 6. Revenue & Growth
    if any(
        term in text
        for term in (
            "revenue",
            "sales",
            "income",
            "topline",
            "growth",
            "why did revenue",
            "revenue fall",
            "revenue drop",
        )
    ):
        skills.append(Skill.REVENUE_INVESTIGATION)

    # 7. Payment Failures & Gateway Latency
    if any(
        term in text
        for term in (
            "payment",
            "decline",
            "failure",
            "failing",
            "fail",
            "card",
            "gateway",
            "processor",
            "timeout",
        )
    ):
        skills.append(Skill.PAYMENT_ANALYSIS)

    # 8. Risk Assessment
    if any(
        term in text
        for term in ("risk", "volatilit", "exposure", "default", "stability", "health")
    ):
        skills.append(Skill.RISK_ASSESSMENT)

    if not skills:
        skills.append(Skill.FINANCIAL_ANALYSIS)

    unique_skills = tuple(dict.fromkeys(skills))
    primary = unique_skills[0]

    return InvestigationPlan(
        skills=unique_skills,
        primary_skill=primary,
        requires_summary=primary != Skill.SCENARIO_SIMULATION,
        requires_anomaly_model=Skill.ANOMALY_INVESTIGATION in unique_skills,
    )
