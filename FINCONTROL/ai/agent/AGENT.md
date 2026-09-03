# FinControl Autonomous Investigation Agent

The FinControl Autonomous Agent is responsible for end-to-end investigation of financial anomalies, synthesizing causal evidence graphs, and prescribing actionable mitigations.

## Architecture & Responsibilities

1. **Policy Enforcement**: Operates under strict evidence classification constraints defined in `.agents/rules/financial_policy.md`.
2. **MCP Tool Integration**: Reads deterministic facts from read-only backend services through typed MCP interfaces.
3. **Reasoning Engine**: Uses local Ollama (`qwen3:8b`) with tailored prompt templates from `ai/prompts/`.
4. **Causal Graph Generation**: Converts facts, ML anomaly scores, hypotheses, and mitigations into an interactive node-and-link Causal Evidence Graph.

## Agent Structure

```text
ai/agent/
├── .agents/
│   ├── rules/
│   │   └── financial_policy.md     # Inviolable agent rules
│   ├── skills/
│   │   └── financial-investigator/ # Investigation skill manifest
│   └── mcp_config.json             # MCP server configuration
├── coordinator.py                  # Multi-step investigation pipeline
├── agent.py                        # Package export
└── AGENT.md                        # Architecture documentation
```
