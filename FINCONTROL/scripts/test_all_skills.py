import json
import urllib.request

queries = [
    ("Why did revenue fall over the last 3 days?", "revenue_investigation"),
    ("Why are Stripe payments failing in the past 7 days?", "payment_analysis"),
    ("Why did refunds increase in the last 14 days?", "revenue_leakage"),
    ("Are there anomalous transactions in the past week?", "anomaly_investigation"),
    ("What is our cash flow runway this month?", "cashflow_analysis"),
    ("Why are settlements delayed over the last 3 days?", "settlement_analysis"),
    ("What if revenue drops by 25% next quarter?", "scenario_simulation"),
]

print("================================================================================")
print("DYNAMIC SKILL PARSING VERIFICATION")
print("================================================================================\n")

for q, exp in queries:
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/investigations",
        data=json.dumps({"question": q}).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as res:
        data = json.loads(res.read())
        c = data["conclusion"]
        print(f"Query: '{q}'")
        print(f"  -> Primary Skill: {c['primary_skill']}")
        print(f"  -> Title:         {c['title']}")
        print(f"  -> Finding:       {c['text']}")
        print("-" * 80)
