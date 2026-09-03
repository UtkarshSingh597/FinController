"""FastMCP / JSON-RPC Server Entrypoint for FinControl."""

import json
import sys
import logging
from typing import Any, Dict

from .tools.financial_metrics import get_financial_summary_tool, get_revenue_breakdown_by_channel
from .tools.payment_analysis import analyze_payment_health_tool
from .tools.anomaly_tools import run_anomaly_detection_tool
from .tools.simulation_tools import simulate_mitigation_scenario_tool
from .resources.financial_resources import resolve_tenant_ledger_resource, resolve_tenant_health_resource
from .prompts.investigation_prompts import list_mcp_prompts

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FinControlMCPServer")

TOOL_REGISTRY = {
    "get_financial_summary": get_financial_summary_tool,
    "get_revenue_breakdown": get_revenue_breakdown_by_channel,
    "analyze_payment_health": analyze_payment_health_tool,
    "run_anomaly_detection": run_anomaly_detection_tool,
    "simulate_mitigation_scenario": simulate_mitigation_scenario_tool,
}

def list_tools() -> list[dict]:
    """Expose available tools to MCP clients."""
    return [
        {
            "name": "get_financial_summary",
            "description": "Get revenue, settled balances, refunds, and margin summary for an organization.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "organization_id": {"type": "string"},
                    "days": {"type": "integer", "default": 7}
                },
                "required": ["organization_id"]
            }
        },
        {
            "name": "analyze_payment_health",
            "description": "Analyze payment gateway latency, decline reasons, and timeout metrics.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "organization_id": {"type": "string"},
                    "days": {"type": "integer", "default": 3}
                },
                "required": ["organization_id"]
            }
        },
        {
            "name": "run_anomaly_detection",
            "description": "Run Isolation Forest anomaly scoring on financial time-series.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "organization_id": {"type": "string"},
                    "metric_name": {"type": "string", "default": "daily_revenue"}
                },
                "required": ["organization_id"]
            }
        },
        {
            "name": "simulate_mitigation_scenario",
            "description": "Simulate what-if failover routing to recover lost revenue.",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "organization_id": {"type": "string"},
                    "failover_gateway": {"type": "string", "default": "Adyen"},
                    "traffic_shift_pct": {"type": "number", "default": 75.0}
                },
                "required": ["organization_id"]
            }
        }
    ]

def handle_json_rpc(request: Dict[str, Any]) -> Dict[str, Any]:
    """Process a standard JSON-RPC 2.0 request."""
    req_id = request.get("id")
    method = request.get("method")
    params = request.get("params", {})

    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": req_id, "result": {"tools": list_tools()}}
    
    if method == "tools/call":
        tool_name = params.get("name")
        args = params.get("arguments", {})
        if tool_name in TOOL_REGISTRY:
            try:
                res = TOOL_REGISTRY[tool_name](**args)
                return {"jsonrpc": "2.0", "id": req_id, "result": {"content": [{"type": "text", "text": json.dumps(res, indent=2)}]}}
            except Exception as e:
                return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32603, "message": str(e)}}
        return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32601, "message": f"Tool '{tool_name}' not found"}}

    if method == "prompts/list":
        return {"jsonrpc": "2.0", "id": req_id, "result": {"prompts": list_mcp_prompts()}}

    return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32601, "message": f"Method '{method}' not supported"}}

if __name__ == "__main__":
    logger.info("FinControl MCP Server initialized in stdio mode.")
