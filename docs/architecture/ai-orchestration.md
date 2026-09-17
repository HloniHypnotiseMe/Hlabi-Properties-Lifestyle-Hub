# AI Orchestration & Agent Tools

The Lifestyle Hub uses a provider-neutral AI boundary. Ollama is the first supported provider, but business logic does not depend directly on an LLM SDK.

## Flow

Agent Staff → Agent Task → Orchestrator → AI Provider → Reviewable Output → Approval → future tool execution

## Safety boundary

- Agent identity and ownership remain enforced by the API authentication layer.
- Tool access is permission-based rather than inferred from prompts.
- Default permissions are read-only plus message drafting.
- Queueing messages, creating quote requests and scheduling jobs are distinct permissions and should remain approval-gated until explicit production policy allows otherwise.
- AI output is not treated as proof that an external action occurred.
- Provider failures become task failures and are recorded as task events.
- No external provider credentials are stored in source control.

## Ollama

Set `OLLAMA_URL` to activate the Ollama adapter. Without it, the API uses a disabled adapter and does not silently call an external AI service.

This stage does not yet implement autonomous tool execution, CRM writes, WhatsApp sending, payment actions or scheduling-provider calls. Those capabilities require dedicated adapters, idempotency, authorization, audit logs and approval policy.
