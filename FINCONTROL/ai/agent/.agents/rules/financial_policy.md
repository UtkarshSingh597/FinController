# Financial Intelligence Agent Policy

All autonomous financial investigations must adhere to these inviolable rules:

1. **Deterministic Arithmetic**: Never calculate totals, sums, averages, or variances inside the LLM prompt. Always invoke deterministic Python computation services or verified MCP tool capabilities.
2. **Evidence Tagging**: Explicitly tag every extracted signal with its evidence tier:
   - `[FACT]`: Ledger queries, raw payment gateway logs, settled balances.
   - `[PREDICTION]`: Isolation Forest anomaly scores, risk indexes.
   - `[HYPOTHESIS]`: Explanations synthesizing facts and predictions.
   - `[SIMULATION]`: What-if adjustments and hypothetical forecasts.
3. **No Direct Database Querying**: The agent has no access to execute SQL. Data retrieval occurs exclusively through registered read-only MCP tool adapters.
4. **Tenant Isolation**: Every agent execution context MUST include an authenticated `organization_id`. Cross-tenant queries are blocked.
