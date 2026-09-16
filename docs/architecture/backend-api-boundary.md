# Backend API boundary

The Lifestyle Hub now has a dedicated `apps/api` service boundary for homeowner workflows.

## Current MVP endpoints

- `GET /health`
- `GET /api/v1/homeowner/properties/:propertyId`
- `POST /api/v1/homeowner/audits`
- `GET /api/v1/homeowner/audits/:auditId`

## Security boundary

The current `x-hlabi-user-id` header is a development-only identity adapter. It must be replaced by a verified session/token and server-side authorization before production use. Property and audit reads are scoped to the authenticated owner ID.

## Persistence boundary

The repository interface intentionally separates HTTP/API concerns from storage. The current implementation is an in-memory adapter so the frontend and API contracts can be developed without committing production credentials or infrastructure.

The production adapter should use PostgreSQL (with a migration-managed schema) and must persist users, properties, audits, findings, supplier quotes, service jobs, documents and activity events. Authentication, authorization, POPIA controls, audit logging and retention rules must be enforced server-side.

## Home audit flow

`self-assessment -> API submission -> professional verification -> findings -> quote request -> supplier selection -> job -> evidence -> renewal plan`

The API must not treat the homeowner self-assessment as a professional inspection or insurance underwriting decision.
