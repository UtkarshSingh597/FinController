import os
from pathlib import Path
from typing import Any, Dict

PROMPTS_DIR = Path(__file__).resolve().parent

def load_prompt_template(filename: str) -> str:
    """Load a markdown prompt template from the prompts directory."""
    path = PROMPTS_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Prompt template '{filename}' not found in {PROMPTS_DIR}")
    return path.read_text(encoding="utf-8")

def get_system_prompt() -> str:
    """Return the base FinControl system prompt."""
    return load_prompt_template("system_prompt.md")

def format_investigation_prompt(
    organization_id: str,
    user_question: str,
    facts: Dict[str, Any],
    predictions: Dict[str, Any],
    active_skills: list,
) -> str:
    """Render the root cause investigation prompt."""
    import json
    template = load_prompt_template("investigation_prompt.md")
    return template.format(
        organization_id=organization_id,
        user_question=user_question,
        facts_json=json.dumps(facts, indent=2, default=str),
        predictions_json=json.dumps(predictions, indent=2, default=str),
        active_skills_list=", ".join(active_skills),
    )

def format_anomaly_prompt(
    metric_name: str,
    timestamp: str,
    observed_value: float,
    baseline_range: str,
    anomaly_score: float,
    feature_contributions: Dict[str, float],
) -> str:
    """Render the anomaly interpretation prompt."""
    import json
    template = load_prompt_template("anomaly_interpretation.md")
    return template.format(
        metric_name=metric_name,
        timestamp=timestamp,
        observed_value=observed_value,
        baseline_range=baseline_range,
        anomaly_score=f"{anomaly_score:.3f}",
        feature_contributions_json=json.dumps(feature_contributions, indent=2, default=str),
    )

def format_evidence_graph_prompt(evidence_payload: Dict[str, Any]) -> str:
    """Render the evidence graph synthesis prompt."""
    import json
    template = load_prompt_template("evidence_graph_prompt.md")
    return template.format(evidence_payload=json.dumps(evidence_payload, indent=2, default=str))
