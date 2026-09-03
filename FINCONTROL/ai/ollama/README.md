# FinControl Ollama Integration

This directory contains the Ollama configuration, custom Modelfile, and client wrapper for local LLM inference in the FINCONTROL financial intelligence platform.

## Architecture

- **Base Model**: `qwen3:8b` (Quantized Q4_K_M, 8.2B parameters)
- **Custom Modelfile**: Tailored system prompt strictly enforcing evidence classification (`FACT`, `PREDICTION`, `HYPOTHESIS`, `SIMULATION`), zero hallucination, and anti-SQL execution rules.
- **Client**: `client.py` provides synchronous and chat completion endpoints with automatic JSON output structuring.

## Setup & Running

1. **Start Ollama**:
   ```powershell
   ollama serve
   ```

2. **Build Custom Model**:
   ```powershell
   pwsh ./setup_model.ps1
   ```

3. **Verify Installation**:
   ```powershell
   ollama run fincontrol-qwen "Explain how evidence classification works in FinControl"
   ```
