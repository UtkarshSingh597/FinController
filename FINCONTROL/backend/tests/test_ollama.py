import httpx

from app.ai.ollama import OllamaClient


def test_ollama_adapter_returns_model_content(monkeypatch) -> None:
    def fake_post(*args, **kwargs):
        assert kwargs["json"]["model"] == "qwen3:8b"
        return httpx.Response(
            200,
            json={"message": {"content": "Evidence-backed summary."}},
            request=httpx.Request("POST", "http://localhost:11434/api/chat"),
        )

    monkeypatch.setattr(httpx, "post", fake_post)
    client = OllamaClient()
    assert client.explain(system="facts only", prompt="summarize") == "Evidence-backed summary."
