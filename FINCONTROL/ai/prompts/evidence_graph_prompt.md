# Causal Evidence Graph Synthesis Prompt

Synthesize the investigation findings into a structured JSON graph representing the causal relationships between facts, predictions, hypotheses, and mitigations.

## Input Evidence
{evidence_payload}

## Output Format Specification
Output ONLY valid JSON matching this schema:

```json
{
  "nodes": [
    {
      "id": "node-1",
      "type": "QUESTION | POLICY | FACT | PREDICTION | HYPOTHESIS | MITIGATION",
      "label": "Short human readable label",
      "description": "Detailed explanation of the node",
      "severity": "LOW | MEDIUM | HIGH | CRITICAL | INFO",
      "metadata": {
        "metric": "optional_metric_name",
        "value": 12345.67,
        "confidence": 0.95
      }
    }
  ],
  "edges": [
    {
      "source": "node-1",
      "target": "node-2",
      "relation": "TRIGGERS | EXPLAINS | SUPPORTS | MITIGATES",
      "weight": 1.0
    }
  ]
}
```
Do not include markdown backticks around the JSON. Return only the raw JSON payload.
