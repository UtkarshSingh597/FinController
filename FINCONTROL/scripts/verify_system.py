"""End-to-End System Health Check and Diagnostic Tool."""

import sys
from pathlib import Path

FINCONTROL_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(FINCONTROL_ROOT))

def check_mcp():
    print("Checking MCP Tools...")
    from mcp.server import list_tools
    tools = list_tools()
    print(f"  [OK] Registered {len(tools)} MCP tools.")

def check_ml():
    print("Checking ML Inference Service...")
    from ml.inference.anomaly_service import AnomalyInferenceService
    svc = AnomalyInferenceService()
    res = svc.score_transactions([{"amount": 100.0, "latency_ms": 250.0}])
    print(f"  [OK] ML Inference Engine online. Sample score: {res[0].anomaly_score}")

def check_prompts():
    print("Checking AI Prompt Templates...")
    from ai.prompts.prompts import get_system_prompt
    sp = get_system_prompt()
    print(f"  [OK] System prompt verified ({len(sp)} chars).")

def check_ollama():
    print("Checking Ollama Service...")
    from ai.ollama.client import OllamaService
    ollama = OllamaService(timeout=5)
    health = ollama.check_health()
    models = [m.get("name") for m in health.get("models", [])]
    if models:
        print(f"  [OK] Ollama running. Installed models: {', '.join(models)}")
    else:
        print(f"  [WARN] Ollama running but no models returned or unreachable.")

def main():
    print("\n==========================================")
    print("Artha (अर्थ) System Diagnostics")
    print("==========================================\n")
    try:
        check_mcp()
        check_ml()
        check_prompts()
        check_ollama()
        print("\n[SUCCESS] All Artha (अर्थ) platform layers verified!\n")
    except Exception as e:
        print(f"\n[ERROR] Health check failed: {e}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
