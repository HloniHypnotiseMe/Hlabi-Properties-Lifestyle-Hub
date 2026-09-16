# Integration adapters

This directory contains provider-neutral contracts for the Lifestyle Hub.

Implement providers behind `IntegrationCapabilities`; do not import provider SDKs into domain or portal code.

Recommended adapters:

- `email/` — BillionMail
- `whatsapp/` — Whatomate
- `sms/` — Arkesel
- `payments/` — RemotePay / PayGate
- `agents/` — agency-agents / agency-orchestrator / crewAI / LangGraph
- `memory/` — mem0 / LightRAG / Qdrant
- `scraping/` — Scrapling / crawl4ai / browser-use
- `voice/` — Whisper + selected TTS engine
- `content/` — ComfyUI + content workers
- `llm/` — Ollama

Adapters should be small, tested and independently replaceable. They must never expose credentials to browser clients.