"""MCP Resource Resolvers for FinControl."""

from typing import Any, Dict

def resolve_tenant_ledger_resource(organization_id: str) -> Dict[str, Any]:
    """Read-only resource for fincontrol://tenants/{organization_id}/ledger."""
    return {
        "uri": f"fincontrol://tenants/{organization_id}/ledger",
        "mimeType": "application/json",
        "content": {
            "organization_id": organization_id,
            "currency": "USD",
            "account_status": "ACTIVE",
            "active_ledgers": ["operating_revenue", "refund_reserve", "processing_fees"],
            "settlement_frequency": "T+2"
        }
    }

def resolve_tenant_health_resource(organization_id: str) -> Dict[str, Any]:
    """Read-only resource for fincontrol://tenants/{organization_id}/health."""
    return {
        "uri": f"fincontrol://tenants/{organization_id}/health",
        "mimeType": "application/json",
        "content": {
            "organization_id": organization_id,
            "overall_status": "WARNING",
            "active_incidents": 1,
            "incident_summary": "Stripe gateway timeout rate exceeded 5.0% threshold."
        }
    }
