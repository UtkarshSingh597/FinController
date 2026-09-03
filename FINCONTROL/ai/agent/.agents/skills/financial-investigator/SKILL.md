---
name: financial-investigator
description: >-
  Coordinates multi-step financial root-cause investigations across payments, settlements,
  revenue leakage, cash flow runway, and ML anomaly detection.
  Activate this skill when the controller asks to investigate financial drops, discrepancies, or anomalies.
---

# Financial Investigation Skill

Guides the autonomous agent through diagnosing financial anomalies, assembling factual context via MCP tools, calculating Isolation Forest anomaly scores, and building the causal evidence graph.

## Investigation Pipeline

1. **Classify Question Intent**: Identify relevant financial domain (Revenue, Settlements, Payments, Cashflow).
2. **Fetch Deterministic Facts**: Query read-only MCP capabilities for the target time window.
3. **Execute ML Anomaly Scoring**: Evaluate feature deviations using Isolation Forest models.
4. **Synthesize Causal Hypotheses**: Generate reasoning linking facts to predictions using the Qwen3 8B Ollama model.
5. **Construct Causal Evidence Graph**: Generate nodes and edges matching the platform's schema.
6. **Formulate Mitigation Plan**: Produce immediate and long-term action items.
