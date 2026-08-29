from typing import Protocol

import httpx


class ModelClient(Protocol):
    def explain(self, *, system: str, prompt: str) -> str: ...


class OllamaClient:
    """Minimal replaceable adapter for a locally hosted Ollama model."""

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "qwen3:8b") -> None:
        self.base_url, self.model = base_url.rstrip("/"), model

    def explain(self, *, system: str, prompt: str) -> str:
        response = httpx.post(
            f"{self.base_url}/api/chat",
            json={
                "model": self.model,
                "stream": False,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
            },
            timeout=30,
        )
        response.raise_for_status()
        content = response.json().get("message", {}).get("content")
        if not isinstance(content, str) or not content.strip():
            raise ValueError("Ollama returned no explanation content.")
        return content
