import json
import logging
import os
import urllib.request
import urllib.error
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

class OllamaService:
    """Enterprise Ollama client for local LLM inference in FinControl."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: int = 180,
    ) -> None:
        self.base_url = (base_url or os.getenv("OLLAMA_HOST", "http://localhost:11434")).rstrip("/")
        self.model = model or os.getenv("OLLAMA_MODEL", "qwen3:8b")
        self.timeout = timeout

    def check_health(self) -> Dict[str, Any]:
        """Check if Ollama service is reachable and list available models."""
        url = f"{self.base_url}/api/tags"
        try:
            req = urllib.request.Request(url, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=5) as response:
                return json.loads(response.read().decode("utf-8"))
        except Exception as e:
            logger.error(f"Ollama health check failed: {e}")
            return {"status": "unreachable", "error": str(e), "models": []}

    def generate(
        self,
        prompt: str,
        system: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.2,
    ) -> str:
        """Synchronous text generation via /api/generate."""
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": model or self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
            },
        }
        if system:
            payload["system"] = system

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                result = json.loads(response.read().decode("utf-8"))
                return result.get("response", "")
        except urllib.error.HTTPError as e:
            error_msg = e.read().decode("utf-8")
            raise RuntimeError(f"Ollama HTTP {e.code} error: {error_msg}")
        except urllib.error.URLError as e:
            raise RuntimeError(f"Ollama connection error at {url}: {e}")

    def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.2,
        format_json: bool = False,
    ) -> str:
        """Chat completion endpoint via /api/chat with optional JSON output enforcement."""
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": model or self.model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature,
            },
        }
        if format_json:
            payload["format"] = "json"

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                result = json.loads(response.read().decode("utf-8"))
                content = result.get("message", {}).get("content", "")
                if not content:
                    raise ValueError("Ollama returned an empty chat response.")
                return content
        except Exception as e:
            logger.error(f"Error executing chat completion with model {model or self.model}: {e}")
            raise
