# Agent AI Staff / Agent OS

The Agent AI Staff layer gives Hlabi agents a persistent team of specialised digital assistants while keeping consequential external actions behind explicit approval boundaries.

## Initial staff roles

- Listing Manager — listing readiness, property facts and listing workflow tasks.
- Lead Follow-Up — lead follow-up planning and next actions.
- Marketing Assistant — campaign briefs and content plans.
- CRM Coordinator — client/lead workflow hygiene and overdue actions.
- Communications Assistant — client-message drafts for human approval.
- Scheduling Assistant — proposed appointments and reminders.
- Reputation Assistant — review-response drafts and reputation follow-ups.

## Workflow boundary

```text
Agent
  -> Agent Staff
      -> Agent Task Queue
          -> Orchestrator / LLM / tools (future provider adapters)
              -> Approval Gate where required
                  -> Messaging / CRM / scheduling / content tools
                      -> Audit event
```

The current implementation persists staff, tasks and task events and exposes a provider-neutral API boundary. It does not call external LLMs, WhatsApp, email, CRM or scheduling systems yet.

## Safety and control

- Agent ownership is scoped to the authenticated AGENT principal.
- Property IDs are optional but supported for property-scoped work.
- New tasks default to `requiresApproval=true`.
- External side effects must be connected through approved integrations and an auditable approval workflow.
- Development authentication remains development-only; production identity must be verified server-side.
- Agent output is assistance, not professional, legal, valuation, underwriting or compliance certification.

## Next integration stages

1. Connect Ollama and the existing orchestration/multi-agent adapter registry.
2. Add structured tool permissions and approval records.
3. Add lead/CRM domain objects and agent-generated next actions.
4. Connect approved messaging templates and delivery events.
5. Add agent dashboard UI and operational metrics.
