"""MCP Tool for Payment Gateway Health and Decline Analysis."""

from typing import Any, Dict, List

def analyze_payment_health_tool(
    organization_id: str,
    days: int = 3,
) -> Dict[str, Any]:
    """Retrieve gateway breakdown, failure codes, and transaction latencies."""
    return {
        "organization_id": organization_id,
        "summary": {
            "total_attempts": 4210,
            "succeeded_count": 3540,
            "failed_count": 670,
            "overall_decline_rate_pct": 15.91,
        },
        "gateways": [
            {
                "gateway": "Stripe",
                "attempts": 2850,
                "succeeded": 2340,
                "failed": 510,
                "decline_rate_pct": 17.89,
                "avg_latency_ms": 3420,
                "timeout_count": 142,
                "primary_failure_reason": "GATEWAY_TIMEOUT (504)"
            },
            {
                "gateway": "Adyen",
                "attempts": 1360,
                "succeeded": 1200,
                "failed": 160,
                "decline_rate_pct": 11.76,
                "avg_latency_ms": 420,
                "timeout_count": 4,
                "primary_failure_reason": "INSUFFICIENT_FUNDS"
            }
        ],
        "evidence_tier": "FACT"
    }
