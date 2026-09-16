# Integration Environment Reference

All values below are examples/placeholders. Never commit real credentials.

| Capability | Environment | Purpose |
|---|---|---|
| Ollama | `OLLAMA_URL` | Local LLM inference endpoint |
| Qdrant | `QDRANT_URL`, `QDRANT_API_KEY` | Vector memory/retrieval |
| BillionMail | `BILLIONMAIL_URL`, `BILLIONMAIL_API_KEY` | Email service |
| Whatomate | `WHATOMATE_URL`, `WHATOMATE_API_KEY` | WhatsApp service |
| Arkesel | `ARKESEL_URL`, `ARKESEL_API_KEY` | SMS service |
| RemotePay | `REMOTEPAY_URL`, `REMOTEPAY_API_KEY` | Payment service |
| PayGate | `PAYGATE_URL`, `PAYGATE_API_KEY` | Payment alternative |
| Agent orchestration | `AGENT_ORCHESTRATOR_URL` | Agent workflow service |
| mem0 | `MEM0_URL` | Memory service |
| LightRAG | `LIGHTRAG_URL` | Retrieval/RAG service |
| ComfyUI | `COMFYUI_URL` | Image/content generation |
| Whisper | `WHISPER_URL` | Speech-to-text worker |
| TTS | `TTS_URL` | Text-to-speech worker |
| Scraping | `SCRAPING_WORKER_URL` | Discovery/scraping worker |

Credentials should be injected through the hosting platform's secret/environment facility. The frontend receives only public configuration such as the API base URL.