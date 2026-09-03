import json
import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from app.ai.ollama import OllamaClient
from app.ai.prompts.prompts import (
    format_evidence_graph_prompt,
    format_investigation_prompt,
    get_system_prompt,
)

logger = logging.getLogger(__name__)

@dataclass
class InvestigationContext:
    organization_id: str
    question: str
    time_window_days: int = 7
    facts: Dict[str, Any] = field(default_factory=dict)
    predictions: Dict[str, Any] = field(default_factory=dict)
    hypotheses: List[str] = field(default_factory=list)
    mitigations: List[Dict[str, Any]] = field(default_factory=list)
    graph_data: Dict[str, Any] = field(default_factory=dict)

class FinancialAgentCoordinator:
    """Coordinates multi-step autonomous financial investigations."""

    def __init__(self, ollama_client: Optional[OllamaClient] = None) -> None:
        self.ollama = ollama_client or OllamaClient()

    def run_investigation(
        self,
        organization_id: str,
        question: str,
        facts: Dict[str, Any],
        predictions: Dict[str, Any],
        active_skills: Optional[List[str]] = None,
    ) -> InvestigationContext:
        """Execute an end-to-end evidence-backed investigation."""
        skills = active_skills or ["revenue_investigation", "anomaly_investigation"]
        ctx = InvestigationContext(
            organization_id=organization_id,
            question=question,
            facts=facts,
            predictions=predictions,
        )

        system_prompt = get_system_prompt()
        prompt = format_investigation_prompt(
            organization_id=organization_id,
            user_question=question,
            facts=facts,
            predictions=predictions,
            active_skills=skills,
        )

        logger.info(f"Invoking Ollama reasoning for organization {organization_id}...")
        explanation = self.ollama.explain(system=system_prompt, prompt=prompt)
        ctx.hypotheses.append(explanation)

        # Synthesize evidence graph
        try:
            graph_prompt = format_evidence_graph_prompt({
                "question": question,
                "facts": facts,
                "predictions": predictions,
                "explanation": explanation,
            })
            graph_raw = self.ollama.explain(system="You are a strict JSON generator. Output valid JSON only.", prompt=graph_prompt)
            # Clean possible markdown wrap
            cleaned_json = graph_raw.strip()
            if cleaned_json.startswith("```json"):
                cleaned_json = cleaned_json[7:]
            if cleaned_json.startswith("```"):
                cleaned_json = cleaned_json[3:]
            if cleaned_json.endswith("```"):
                cleaned_json = cleaned_json[:-3]
            ctx.graph_data = json.loads(cleaned_json.strip())
        except Exception as e:
            logger.warning(f"Failed to generate structured evidence graph JSON: {e}")
            ctx.graph_data = {"nodes": [], "edges": [], "error": str(e)}

        return ctx
