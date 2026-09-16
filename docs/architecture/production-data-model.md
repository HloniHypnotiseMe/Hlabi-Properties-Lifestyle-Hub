# Production persistence model

The API contract is intentionally storage-agnostic. The first production persistence target is PostgreSQL.

## Core entities

- `users` — identity, role and consent metadata
- `properties` — owner-scoped property records and lifecycle
- `home_audits` — audit status, timestamps and summary score
- `home_audit_findings` — one record per audit area, including verification state
- `renewal_plans` — five-year planning cycle and status
- `renewal_tasks` — actionable maintenance items
- `supplier_quotes` — quote requests and supplier responses
- `service_jobs` — accepted work and lifecycle evidence
- `documents` — controlled property documents and metadata
- `activity_events` — user-visible and operational audit trail

## Authorization invariant

Every property-owned entity must carry or resolve to an owner/property scope that the authenticated server-side identity is authorized to access. Client-provided owner IDs must never be trusted as authorization credentials.

## Data protection

Production implementation must define POPIA-aligned collection purpose, access controls, retention/deletion rules, auditability and appropriate security safeguards before live homeowner data is stored.
