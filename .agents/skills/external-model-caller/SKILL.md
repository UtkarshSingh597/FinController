---
name: external-model-caller
description: >-
  Calls external AI models (e.g. OpenAI, Anthropic Claude, Ollama, DeepSeek, Groq, or local LLMs)
  for secondary reviews, alternative implementations, specialized prompts, or multi-model evaluations.
  Activate this skill whenever the user requests querying an external model, comparing model responses,
  or running inference through third-party AI APIs.
---

# External Model Caller Skill

This skill allows the agent to route queries, prompts, and code snippets to external LLM providers and capture their responses.

## Supported Providers

| Provider | Default Model | Environment Variable / Setting |
| :--- | :--- | :--- |
| **Ollama (Local)** | `qwen:8b` (or `qwen2.5:7b`) | `OLLAMA_MODEL`, `OLLAMA_HOST` (default `http://localhost:11434`) |
| **OpenAI / Compatible** | `gpt-4o` | `OPENAI_API_KEY` (or custom `--base-url`) |
| **Anthropic** | `claude-3-5-sonnet-20241022` | `ANTHROPIC_API_KEY` |
| **DeepSeek / Groq / OpenRouter** | Custom | Specify `--base-url` and `--api-key` |

---

## Workflow Steps

### 1. Prepare Prompt / Input
Ensure the prompt or code to evaluate is prepared:
- For short questions: Pass directly via `--prompt "<text>"`.
- For large documents or code files: Write to a file and pass `--prompt-file <path>`.

### 2. Execute the Script
Run the helper script using the `run_command` tool:

#### Example: Querying Local Ollama (Qwen 8B)
```powershell
# Uses default qwen:8b
python .agents/skills/external-model-caller/scripts/call_external_model.py --provider ollama --prompt "Review this code for bugs"

# Explicit model specification
python .agents/skills/external-model-caller/scripts/call_external_model.py --provider ollama --model qwen:8b --prompt-file ./path/to/prompt.txt
```

#### Example: Querying Anthropic Claude
```powershell
python .agents/skills/external-model-caller/scripts/call_external_model.py --provider anthropic --model claude-3-5-sonnet-20241022 --prompt-file ./path/to/prompt.txt
```

#### Example: Querying DeepSeek / Groq / Local vLLM
```powershell
python .agents/skills/external-model-caller/scripts/call_external_model.py --provider openai --base-url "https://api.deepseek.com/v1" --model deepseek-chat --prompt "Refactor this function"
```

### 3. Handle & Present Output
- If `--output-file` is specified, read or embed the output into your response.
- Review and synthesize the external model's response for the user.
