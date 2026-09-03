# FINCONTROL — Financial Data Catalog & Schemas

This directory contains financial datasets, synthetic transaction ledgers, ML baseline feature distributions, and simulation scenario blueprints.

## Directory Structure

```text
data/
├── demo/
│   ├── demo_organization.json       # Tenant metadata, risk thresholds, processor routing
│   ├── demo_transactions.json       # 1,000 synthetic transactions with gateway timeout clusters
│   └── demo_settlements.json        # Processor settlement batches, fees, and delayed holds
├── raw/
│   ├── gateway_telemetry.json       # Raw HTTP response codes (504s), latencies, and processor logs
│   └── disputes_and_refunds.json    # Chargeback claims, fraud flags, and dispute lifecycle stages
├── processed/
│   ├── daily_financial_aggregates.json # 30-day cleaned revenue, margin, and decline time-series
│   └── anomaly_features_baseline.json  # Feature distributions and thresholds for ML models
└── scenarios/
    ├── stripe_outage_failover.json  # What-if scenario: routing failover from Stripe to Adyen
    ├── chargeback_surge_mitigation.json # What-if scenario: 3DS threshold tightening
    └── settlement_delay_liquidity_shock.json # What-if scenario: processor payout freeze
```

## Evidence Classification in Datasets

All datasets conform to the platform's four immutable evidence tiers:
1. **`FACT`**: Ground truth values in `demo/` and `raw/` representing immutable transactional ledgers.
2. **`PREDICTION`**: Outlier thresholds in `processed/anomaly_features_baseline.json`.
3. **`SIMULATION`**: What-if projections in `scenarios/*.json`.
