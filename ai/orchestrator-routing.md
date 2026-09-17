# Orchestrator Routing Guide

Use this as the first-pass routing map. The orchestrator should choose the smallest suitable component and keep business logic behind Hlabi adapters.

| Task | Primary references | Preferred deployment pattern |
|---|---|---|
| Agent casting / specialist roles | `agency-agents`, `Agent-OS`, `ClawTeam`, `MetaGPT`, `crewAI` | agent/orchestration service |
| Workflow DAG / durable orchestration | `langgraph`, `prefect`, `n8n`, `activepieces`, `huginn` | workflow worker/service |
| Agent routing / model gateway | `ClawRouter`, `OmniRoute`, `optillm` | gateway service |
| Coding agents | `aider`, `OpenHands`, `claude-task-master`, `oh-my-codex`, `nanocoder`, `everything-claude-code`, `claude-code-local` | isolated engineering worker |
| Agent/MCP discovery | `50-essential-mcp-servers`, `awesome-mcp-servers`, `n8n-mcp`, `mcp-toolbox`, `jadx-ai-mcp` | reference/MCP layer |
| Memory / RAG / knowledge | `Acontext`, `anything-llm`, `supavec`, `obsidian-skills`, `anytype-ts` | knowledge service + vector store |
| Local LLM inference | `LocalAI`, `koboldcpp`, `nanoGPT`, `transformers` | GPU/CPU inference service |
| Voice STT/TTS/conversion | `whisper`, `F5-TTS`, `fish-speech`, `GPT-SoVITS`, `Real-Time-Voice-Cloning`, `Retrieval-based-Voice-Conversion-WebUI`, `chatterbox`, `index-tts`, `supertonic`, `voicetypr`, `pipecat`, `Voicebox`-related repos | media worker |
| Image / video generation | `Fooocus`, `Open-Higgsfield-AI`, `BiRefNet`, `Wan2.2`, `ideogram4`, `OpenCut`, `VidBee`, `html-video`, `MoneyPrinterV2`, `VisoMaster-Fusion`, `Manim` | GPU/content worker |
| Browser automation | `browser-use`, `stagehand`, `camofox-browser`, `camoufox`, `Agent-Reach` | isolated browser worker |
| Scraping / crawling | `Scrapling`, `crawly`, `autoscraper`, `deepcrawl`, `curl-impersonate`, `yt-dlp` | isolated scraping worker |
| Email / messaging | `BillionMail`, `listmonk`, `docker-mailserver`, `mailflare`, `telegraf` | messaging service; provider adapter |
| CRM / business systems | `twenty`, `nocodb`, `cal.diy`, `AppFlowy`, `skiff-apps`, `RepoStore` | back-office/service layer |
| Payments / finance | `remote-pay-holdings`, `BBLA-Back-end`, `FinceptTerminal`, `TradingAgents`, `Python-NSE-Option-Chain-Analyzer` | isolated integration/research layer; compliance required |
| Security / observability | `prowler`, `crowdsec`, `uptime-kuma`, `watchtower`, `AdGuardHome`, `DnsServer`, `ServerKit` | infrastructure/security service |
| Frontend / design | `advanced-react-patterns`, `shadcn-admin-kit`, `fluentui`, `penpot`, `builder`, `capacitor`, `TostUI` | selectively reuse patterns/components |
| Data / analytics / geo | `analytics`, `city2graph`, `kepler.gl`, `worldview` | analytics/visualization service |
| Learning / skills / reference | `andrej-karpathy-skills`, `application-skills`, `Product-Manager-Skills`, `Awesome-finance-skills`, `developer-roadmap`, `Ultimate-AI-Engineer-Roadmap-2026`, `startup-skill`, `book-to-skill`, `awesome-ai-*`, `free-programming-books`, `build-your-own-x`, `the-book-of-secret-knowledge` | knowledge/reference only |

## Decision order

1. Existing Hlabi capability.
2. Existing adapter/provider boundary.
3. Smallest suitable forked project.
4. Mature external project as a separately deployed worker.
5. New code only where the capability is genuinely missing.

## Production gate

Before an agent recommends activation, inspect license, maintenance activity, dependency/security posture, resource requirements, data handling, authentication, tenancy isolation, and rollback strategy. A repository being present on the profile is not approval for production use.
