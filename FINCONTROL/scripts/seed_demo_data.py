"""Generates synthetic multi-tenant financial data for local demo and testing."""

import json
import random
from datetime import datetime, timezone, timedelta
from pathlib import Path

DATA_OUT = Path(__file__).resolve().parent.parent / "data" / "demo_transactions.json"

GATEWAYS = ["Stripe", "Adyen", "PayPal", "Checkout.com"]
CHANNELS = ["E-Commerce Web", "Mobile App API", "Point of Sale (POS)"]
FAILURE_REASONS = ["GATEWAY_TIMEOUT", "INSUFFICIENT_FUNDS", "DO_NOT_HONOR", "INVALID_CVV", "FRAUD_SUSPECTED"]

def generate_demo_dataset(num_records: int = 500) -> list:
    """Generate realistic transaction logs with intentional anomalies."""
    records = []
    now = datetime.now(timezone.utc)

    for i in range(num_records):
        days_ago = random.uniform(0, 14)
        tx_time = now - timedelta(days=days_ago)
        
        # Inject artificial Stripe timeout cluster 1 day ago
        is_incident_window = 0.8 <= days_ago <= 1.2
        gateway = "Stripe" if (is_incident_window and random.random() < 0.8) else random.choice(GATEWAYS)
        
        if is_incident_window and gateway == "Stripe":
            status = "FAILED" if random.random() < 0.45 else "SUCCEEDED"
            latency = random.uniform(2800, 6500)
            failure_reason = "GATEWAY_TIMEOUT (504)" if status == "FAILED" else None
            amount = round(random.uniform(50, 4500), 2)
        else:
            status = "SUCCEEDED" if random.random() < 0.94 else "FAILED"
            latency = random.uniform(150, 600)
            failure_reason = random.choice(FAILURE_REASONS) if status == "FAILED" else None
            amount = round(random.uniform(15, 850), 2)

        records.append({
            "transaction_id": f"tx_{100000 + i}",
            "organization_id": "org_demo_fintech",
            "gateway": gateway,
            "channel": random.choice(CHANNELS),
            "amount": amount,
            "currency": "USD",
            "status": status,
            "failure_reason": failure_reason,
            "latency_ms": round(latency, 1),
            "timestamp": tx_time.isoformat(),
        })

    return records

def main():
    DATA_OUT.parent.mkdir(parents=True, exist_ok=True)
    dataset = generate_demo_dataset(1000)
    with open(DATA_OUT, "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2)
    print(f"Generated {len(dataset)} synthetic financial transactions at: {DATA_OUT}")

if __name__ == "__main__":
    main()
