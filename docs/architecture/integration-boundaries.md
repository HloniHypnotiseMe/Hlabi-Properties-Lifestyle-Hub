# Integration Boundary Contract

The Lifestyle Hub owns business state. External services provide capabilities.

## Owned by Hlabi API

- users and roles
- properties
- home audits
- findings
- renewal plans/tasks
- suppliers and verification state
- quotes and jobs
- documents and evidence metadata
- customer communication preferences
- payment intents/reconciliation records
- agent/academy/franchise business state
- security/audit events

## Provided by integrations

- LLM inference
- agent workflow execution
- semantic memory and vector retrieval
- email, WhatsApp and SMS delivery
- payment initiation and provider webhooks
- speech recognition and synthesis
- image/video generation
- web discovery/scraping

## Rule

No external provider may become the source of truth for a core Hlabi business entity. Provider IDs are stored as external references for reconciliation.

This makes it possible to replace a provider without migrating the customer-facing product model.