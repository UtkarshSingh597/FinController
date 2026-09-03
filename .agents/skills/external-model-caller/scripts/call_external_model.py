import os
import sys
import json
import argparse
import urllib.request
import urllib.error

def call_ollama(prompt: str, model: str = "llama3:latest", host: str = "http://localhost:11434") -> str:
    """Query a local Ollama instance without external dependencies."""
    url = f"{host.rstrip('/')}/api/generate"
    payload = json.dumps({"model": model, "prompt": prompt, "stream": False}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("response", "")
    except urllib.error.URLError as e:
        raise RuntimeError(f"Failed to connect to Ollama at {url}: {e}")

def call_openai_compatible(prompt: str, model: str = "gpt-4o", base_url: str = "https://api.openai.com/v1", api_key: str = None) -> str:
    """Query any OpenAI-compatible endpoint (OpenAI, DeepSeek, Groq, OpenRouter, vLLM, etc.)."""
    key = api_key or os.getenv("OPENAI_API_KEY")
    if not key and "localhost" not in base_url and "127.0.0.1" not in base_url:
        raise ValueError("Missing API key. Set OPENAI_API_KEY environment variable or pass --api-key.")

    url = f"{base_url.rstrip('/')}/chat/completions"
    headers = {
        "Content-Type": "application/json"
    }
    if key:
        headers["Authorization"] = f"Bearer {key}"

    payload = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7
    }).encode("utf-8")

    req = urllib.request.Request(url, data=payload, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        raise RuntimeError(f"HTTP Error {e.code} from {url}: {error_body}")
    except urllib.error.URLError as e:
        raise RuntimeError(f"Network error connecting to {url}: {e}")

def call_anthropic(prompt: str, model: str = "claude-3-5-sonnet-20241022", api_key: str = None) -> str:
    """Query Anthropic Messages API."""
    key = api_key or os.getenv("ANTHROPIC_API_KEY")
    if not key:
        raise ValueError("Missing API key. Set ANTHROPIC_API_KEY environment variable or pass --api-key.")

    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
    payload = json.dumps({
        "model": model,
        "max_tokens": 4096,
        "messages": [{"role": "user", "content": prompt}]
    }).encode("utf-8")

    req = urllib.request.Request(url, data=payload, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return "".join([block.get("text", "") for block in data.get("content", [])])
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        raise RuntimeError(f"HTTP Error {e.code} from Anthropic: {error_body}")

def main():
    parser = argparse.ArgumentParser(description="Query external AI models from a script.")
    parser.add_argument("--prompt", help="Direct text prompt string")
    parser.add_argument("--prompt-file", help="Path to text/markdown file containing prompt")
    parser.add_argument("--provider", choices=["openai", "ollama", "anthropic"], default="openai", help="Target LLM provider")
    parser.add_argument("--model", help="Model name (e.g. gpt-4o, claude-3-5-sonnet-20241022, llama3)")
    parser.add_argument("--base-url", help="Custom base URL for OpenAI-compatible endpoints or Ollama host")
    parser.add_argument("--api-key", help="API key (defaults to provider environment variable)")
    parser.add_argument("--output-file", help="Optional file path to write output to")

    args = parser.parse_args()

    # Read prompt input
    if args.prompt_file:
        with open(args.prompt_file, "r", encoding="utf-8") as f:
            prompt_text = f.read()
    elif args.prompt:
        prompt_text = args.prompt
    else:
        # Read from stdin if piped
        if not sys.stdin.isatty():
            prompt_text = sys.stdin.read()
        else:
            parser.error("Must provide either --prompt, --prompt-file, or pipe input via stdin.")

    # Dispatch to provider
    if args.provider == "ollama":
        model = args.model or os.getenv("OLLAMA_MODEL", "qwen3:8b")
        host = args.base_url or os.getenv("OLLAMA_HOST", "http://localhost:11434")
        response = call_ollama(prompt=prompt_text, model=model, host=host)
    elif args.provider == "anthropic":
        model = args.model or "claude-3-5-sonnet-20241022"
        response = call_anthropic(prompt=prompt_text, model=model, api_key=args.api_key)
    else:
        # OpenAI or OpenAI-compatible
        model = args.model or "gpt-4o"
        base_url = args.base_url or "https://api.openai.com/v1"
        response = call_openai_compatible(prompt=prompt_text, model=model, base_url=base_url, api_key=args.api_key)

    if args.output_file:
        with open(args.output_file, "w", encoding="utf-8") as f:
            f.write(response)
        print(f"Response written to: {args.output_file}")
    else:
        print(response)

if __name__ == "__main__":
    main()
