# Integration Rollout Controls

The integration list supplied for the Lifestyle Hub is now represented as a provider-neutral architecture. This does **not** install or activate third-party services automatically.

## Activation states

- `FOUNDATION`: interface and configuration exist.
- `SANDBOX`: credentials configured and provider tested without production customer impact.
- `ACTIVE`: production traffic is enabled with monitoring and rollback.
- `DISABLED`: no provider calls permitted.

Messaging and payment providers default to `DISABLED` until credentials and commercial/legal onboarding are complete.

## Provider selection

Provider choice is configuration-driven. Product code should call capability interfaces rather than importing provider SDKs directly.

## Required before production activation

- Provider account and terms accepted.
- Server-side credentials configured as deployment secrets.
- Webhook signature/authentication verified where applicable.
- Data-processing/privacy requirements reviewed.
- Rate limits and retry behavior tested.
- Monitoring and failure alerts configured.
- Sandbox transaction/message tested.
- Rollback path documented.
- For payments, applicable licensing/regulatory structure confirmed.
- For insurance-related workflows, underwriting and regulatory structure confirmed.

## Priority build sequence

### Wave 1 — core platform

PostgreSQL, verified authentication, authorization middleware, audit logging, integration registry.

### Wave 2 — customer communication

BillionMail → Whatomate → Arkesel, with notification preferences and delivery logs.

### Wave 3 — commercial workflow

RemotePay/PayGate sandbox → supplier quotes → service jobs → evidence → settlement.

### Wave 4 — intelligence

Ollama → agent orchestration → mem0/Qdrant/LightRAG → discovery workers.

### Wave 5 — media

Whisper/STT → TTS → ComfyUI/content workers.

### Wave 6 — operations

Cloudflare Pages → Contabo services → Uptime Kuma/HyperDX/Prowler/CrowdSec as infrastructure is deployed and configured.

The objective is to make the Lifestyle Hub an integrated operating platform while keeping provider dependencies replaceable and customer data protected.