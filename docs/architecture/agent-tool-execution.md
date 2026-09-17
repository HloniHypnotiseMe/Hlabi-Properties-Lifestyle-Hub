# Agent Tool Execution

The Agent OS now has a provider-neutral execution boundary for property-scoped tools.

## Tools

- `property.read` — read the scoped property.
- `audit.read` — read the latest or explicitly identified audit.
- `quotes.read` — read quote requests for the scoped property.
- `jobs.read` — read service jobs for the scoped property.
- `message.draft` — produce a draft without sending it.
- `message.queue` — queue email, WhatsApp or SMS through the messaging boundary.
- `task.create` — create a follow-up Agent OS task.
- `quote-request.create` — create a supplier quote request from eligible suppliers.
- `job.schedule` — schedule an existing service job.

## Security model

1. Requests require an authenticated `AGENT` principal.
2. The requested agent staff member must belong to the authenticated principal and be active.
3. Permissions come from the agent staff configuration. If no permissions are configured, the agent receives the read-only + drafting baseline from `defaultReadOnlyPermissions()`.
4. Every execution requires a property scope and verifies that the authenticated principal owns that property through the existing repository authorization boundary.
5. Audit and job identifiers are re-checked against the same property scope.
6. Consequential tools (`message.queue`, `task.create`, `quote-request.create`, `job.schedule`) require an Agent OS task in `WAITING_APPROVAL` plus a persisted `HUMAN_APPROVAL_GRANTED` event.
7. Consequential execution is recorded as `TOOL_EXECUTED` and completes the approval task after successful execution.
8. Messaging uses the existing idempotency key boundary; live providers remain disabled until provider configuration and compliance onboarding.

## Approval flow

`Agent task → WAITING_APPROVAL → human approval event → approved tool execution → TOOL_EXECUTED → COMPLETED`

Approval is deliberately separate from generated AI output. The AI layer does not receive permission to perform consequential actions merely because it generated a recommendation.

## Production extension

The current property authorization boundary is intentionally conservative: an authenticated agent can only execute against properties available to that principal through the existing owner-scoped repository. Before agency staff are allowed to operate across homeowner portfolios, add an explicit, auditable agent-to-property/agency assignment model rather than bypassing owner checks.

Provider calls, CRM writes, scheduling-provider calls and external payment actions remain behind provider adapters and must not be enabled by this execution layer without explicit permissions, webhook/security controls, idempotency and compliance review.
