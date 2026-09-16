# Hlabi Lifestyle Hub — Platform Integration Architecture

## Principle

The Hlabi website and Lifestyle Hub use a provider-neutral integration layer. Open-source projects listed by the business are treated as replaceable infrastructure components, not as hard-coded product dependencies.

C6 Group remains the orchestration/IP layer; Hlabi Properties remains the customer-facing brand.

## Integration map

| Layer | Initial provider | Role | Status |
|---|---|---|---|
| Orchestration | agency-agents / agency-orchestrator | Agent casting and workflow DAG | Adapter planned |
| Multi-agent reasoning | crewAI / LangGraph / hermes-agent | Complex agent workflows | Adapter planned |
| Memory | mem0 + Qdrant + LightRAG | Persistent context and retrieval | Adapter planned |
| Email | BillionMail | Transactional email, newsletters and monetisation workflows | Adapter planned |
| WhatsApp | Whatomate | WhatsApp Business messaging | Adapter planned |
| SMS | Arkesel | SMS notifications | Adapter planned |
| Scraping | Scrapling / crawl4ai / browser-use | Business and supplier discovery | Adapter planned |
| Voice | Whisper + F5-TTS / fish-speech | Speech input/output | Adapter planned |
| Content | ComfyUI + MoneyPrinterV2 | Image/video/content generation | Adapter planned |
| Payments | RemotePay + PayGate | Collections and transaction processing | Adapter planned |
| LLM inference | Ollama | Local inference | Adapter planned |
| Hosting | Cloudflare Pages | Public frontend | Deployment target |
| Infrastructure | Contabo Cloud VPS | Self-hosted services | Deployment target |
| DNS/CDN | Cloudflare | DNS, CDN and edge controls | Deployment target |

## Runtime boundary

The browser must never receive provider secrets. Provider credentials belong on the API/server side and must be supplied through deployment secrets or environment variables.

The application should expose business capabilities such as:

- `sendMessage`
- `sendEmail`
- `sendSms`
- `createPayment`
- `requestSupplierDiscovery`
- `generateContent`
- `runAgentWorkflow`
- `rememberContext`
- `retrieveContext`
- `transcribeAudio`
- `synthesizeSpeech`

Providers can then be swapped without changing homeowner, agent, supplier or admin product code.

## Product workflows

### Homeowner

Homeowner → home audit → findings → supplier quote request → supplier job → evidence → payment → renewal plan.

### Agent

Lead → AI follow-up → listing/content → CRM task → reputation monitoring → appointment.

### Supplier

Discovery/verification → lead → quote → job → evidence → payment.

### Academy

Learner → AI roleplay → assessment → progress → human/official qualification workflow.

### Partner/underwriter

Partner onboarding → product configuration → referrals/eligibility → claims or service workflow, subject to legal and regulatory approval.

## Security requirements

1. Use verified server-side authentication before exposing production homeowner data.
2. Enforce tenant/owner scoping on every property, audit, quote, job and document operation.
3. Store secrets only in server-side environment/secrets management.
4. Log security-sensitive events without storing unnecessary personal information.
5. Apply POPIA-aligned purpose limitation, retention and access controls.
6. Do not treat a self-assessment as a professional inspection or underwriting decision.
7. Do not represent the maintenance subscription as insurance until the legal/underwriter structure is confirmed.
8. Payment flows must use the approved payment provider and applicable South African regulatory structure.

## Deployment topology

```text
Cloudflare Pages
  └── Hlabi Web
       │
       ▼
Contabo VPS / API
  ├── Hlabi API
  ├── PostgreSQL
  ├── Qdrant
  ├── Ollama
  ├── Agent orchestration
  ├── Messaging adapters
  ├── Content/voice workers
  └── Monitoring/security
```

Cloudflare is the public edge; the VPS hosts private application services. Provider-specific public webhooks should terminate at the API and be authenticated/validated before processing.

## Rollout order

1. Core API + PostgreSQL + verified authentication.
2. Integration interfaces and configuration registry.
3. Homeowner audit persistence and supplier quote workflow.
4. RemotePay/PayGate payment adapter in sandbox mode.
5. Email/WhatsApp/SMS notification adapters.
6. Agent AI Staff orchestration.
7. Memory + Qdrant retrieval.
8. Scraping/discovery workers.
9. Voice/content workers.
10. Academy and franchise workflows.
11. Production observability and security hardening.

This repository contains integration scaffolding only until provider credentials, service URLs, legal terms and production deployment controls are configured.