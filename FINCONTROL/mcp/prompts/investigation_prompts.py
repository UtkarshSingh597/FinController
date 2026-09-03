"""Pre-packaged prompt templates exposed to MCP clients."""

from typing import Any, Dict, List

PROMPT_INVESTIGATE_DROP = {
    "name": "investigate_revenue_drop",
    "description": "Trigger an end-to-end multi-tier financial investigation for a sudden drop in revenue.",
    "arguments": [
        {"name": "organization_id", "description": "The UUID of the tenant organization", "required": True},
        {"name": "timeframe_days", "description": "Number of days to inspect (default 3)", "required": False}
    ]
}

PROMPT_AUDIT_SETTLEMENTS = {
    "name": "audit_settlement_delays",
    "description": "Audit delayed processor settlement batches and compute cash-drag risk.",
    "arguments": [
        {"name": "organization_id", "description": "Tenant organization ID", "required": True}
    ]
}

def list_mcp_prompts() -> List[Dict[str, Any]]:
    return [PROMPT_INVESTIGATE_DROP, PROMPT_AUDIT_SETTLEMENTS]
