# Anomaly Interpretation Prompt Template

You are evaluating an Isolation Forest anomaly detection output for financial time-series metrics.

## Anomaly Detection Context
- **Metric Name**: `{metric_name}`
- **Observation Timestamp**: `{timestamp}`
- **Observed Value**: `{observed_value}`
- **Baseline Expected Range**: `{baseline_range}`
- **Anomaly Score**: `{anomaly_score}` (Scale: 0.000 normal to 1.000 extreme anomaly)
- **Feature Contribution Breakdown**:
{feature_contributions_json}

## Instructions
1. State whether the anomaly score warrants an immediate alert (Score > 0.700).
2. Interpret the top contributing factors that pushed the metric beyond normal boundaries.
3. Classify the severity tier (`CRITICAL`, `ELEVATED`, `NORMAL`).
4. Output a concise 2-sentence executive summary suitable for a controller dashboard widget.
