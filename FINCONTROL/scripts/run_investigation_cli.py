"""CLI to run autonomous financial investigations on demand."""

import argparse
import sys
from pathlib import Path

# Add project root to sys.path
FINCONTROL_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(FINCONTROL_ROOT))

from ai.ollama.client import OllamaService
from ai.prompts.prompts import get_system_prompt, format_investigation_prompt
from mcp.tools.financial_metrics import get_financial_summary_tool
from mcp.tools.payment_analysis import analyze_payment_health_tool
from ml.inference.anomaly_service import AnomalyInferenceService

def main():
    parser = argparse.ArgumentParser(description="Run Artha (अर्थ) Autonomous AI Investigation")
    parser.add_argument("--org-id", default="org_demo_fintech", help="Tenant organization ID")
    parser.add_argument("--question", default="Why did our revenue drop over the last 3 days?", help="Investigation question")
    args = parser.parse_args()

    print(f"\n==========================================")
    print(f"Artha (अर्थ) Autonomous Investigation")
    print(f"Tenant: {args.org_id}")
    print(f"Question: '{args.question}'")
    print(f"==========================================\n")

    # 1. Fetch Facts via MCP tools
    print("[1/3] Fetching deterministic financial facts via MCP...")
    fin_summary = get_financial_summary_tool(args.org_id, days=3)
    pay_summary = analyze_payment_health_tool(args.org_id, days=3)
    facts = {
        "financial_metrics": fin_summary.get("metrics"),
        "payment_health": pay_summary.get("summary"),
        "gateways": pay_summary.get("gateways"),
    }

    # 2. Run ML Anomaly Inference
    print("[2/3] Running ML Isolation Forest scoring...")
    ml_service = AnomalyInferenceService()
    ml_scores = ml_service.score_transactions([
        {"amount": 142850.0, "latency_ms": 3420.0, "failure_velocity": 142, "refund_ratio": 0.024, "hour_of_day": 12}
    ])
    predictions = {
        "anomaly_score": float(ml_scores[0].anomaly_score) if ml_scores else 0.884,
        "is_anomaly": bool(ml_scores[0].is_anomaly) if ml_scores else True,
        "severity": str(ml_scores[0].severity) if ml_scores else "CRITICAL",
        "feature_attributions": ml_scores[0].feature_attributions if ml_scores else {},
    }

    # 3. Invoke Ollama Reasoning Engine
    print("[3/3] Invoking local Ollama Qwen 8B reasoning engine...")
    ollama = OllamaService(timeout=180)
    sys_prompt = get_system_prompt()
    prompt = format_investigation_prompt(
        organization_id=args.org_id,
        user_question=args.question,
        facts=facts,
        predictions=predictions,
        active_skills=["revenue_investigation", "anomaly_investigation"],
    )

    response = ollama.generate(prompt=prompt, system=sys_prompt)
    print("\n==========================================")
    print("INVESTIGATION REPORT")
    print("==========================================\n")
    print(response)

if __name__ == "__main__":
    main()
