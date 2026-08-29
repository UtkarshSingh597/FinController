from app.ai.orchestrator import Skill, plan_investigation


def test_orchestrator_selects_minimal_revenue_payment_skills() -> None:
    plan = plan_investigation("Why did revenue fall because payments are failing?")
    assert plan.skills == (Skill.REVENUE_INVESTIGATION, Skill.PAYMENT_ANALYSIS)


def test_orchestrator_routes_hypothetical_questions_to_simulation() -> None:
    plan = plan_investigation("What if refunds increase by 20%?")
    assert Skill.SCENARIO_SIMULATION in plan.skills
