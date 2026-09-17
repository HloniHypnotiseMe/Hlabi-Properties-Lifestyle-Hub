# Agent Property Access

Agent Staff operates on a property only when an explicit active `AgentPropertyAccess` record exists. The record binds agent, owner and property and records who granted access.

## Lifecycle

`GRANT -> ACTIVE -> REVOKED`

## Current API

- `GET /api/v1/agent/property-access`
- `POST /api/v1/agent/property-access`
- `DELETE /api/v1/agent/property-access/:accessId`

The current foundation uses the authenticated agent owner boundary. This intentionally does **not** create cross-owner agency access yet. Production should evolve this into an agency-level principal/role model so an authorized manager/admin can grant an agent access to a homeowner property after appropriate consent and contractual controls.

## Tool enforcement

Agent tool execution requires:

1. authenticated active Agent Staff identity;
2. an explicit active agent-property assignment;
3. the existing property-owner authorization check;
4. configured tool permission;
5. for consequential tools, a matching `WAITING_APPROVAL` task and persisted `HUMAN_APPROVAL_GRANTED` event.

No agency-wide portfolio access is implied by agent membership.
