# Agent Property Access

Agent Staff operates on a property only when an explicit active AgentPropertyAccess record exists. The record binds agent, owner and property and records who granted access.

## Production rule

An agent must never receive agency-wide property access merely because it belongs to an agency. Portfolio access is represented by explicit property assignments.

## Lifecycle

`GRANT -> ACTIVE -> REVOKED`

## API

- `GET /api/v1/agent/property-access`
- `POST /api/v1/agent/property-access`
- `DELETE /api/v1/agent/property-access/:accessId`

The current API uses the authenticated agent owner boundary. Production should evolve this into an agency-level principal/role model so a manager or authorized administrator can grant access on behalf of an agency.

## Security

Tool execution continues to require the existing owner/property authorization checks. This layer is an additional agent-to-property assignment boundary, not a replacement for homeowner ownership authorization. Access grants are persisted and revocation is auditable through the access record lifecycle.

No cross-owner access is enabled by this foundation.
