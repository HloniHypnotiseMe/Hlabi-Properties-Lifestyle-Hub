# Authentication & API Boundary

## Purpose

The Lifestyle Hub separates the browser experience from authentication, authorization and persistence so production services can be introduced without rewriting the product UI.

## Current foundation

- `AuthProvider` defines the session contract.
- `ApiClient` defines the authenticated data-access boundary.
- Demo providers are explicitly non-production and contain no real credentials.
- User roles are explicit and can be used for route and API authorization.

## Production requirements

1. Authenticate users through a production identity provider.
2. Establish server-side sessions or short-lived access tokens with refresh/revocation controls.
3. Authorize every property query against the authenticated user's property relationship.
4. Keep tenant/ownership checks on the server; client-side role checks are UX only.
5. Record security-sensitive actions in an immutable audit trail.
6. Apply POPIA data-minimisation, retention, access and deletion policies.
7. Keep secrets in managed environment/secret storage, never in source control.
8. Validate all API payloads at the server boundary.

## Property authorization model

A homeowner may access only properties explicitly linked to their account. Staff, suppliers, agents and administrators require separate permission rules and should not inherit homeowner access merely because they can authenticate.

## API evolution

The first production API can expose REST endpoints such as:

- `GET /api/me`
- `GET /api/properties`
- `POST /api/properties`
- `GET /api/properties/:propertyId/audit`
- `POST /api/properties/:propertyId/audit`
- `GET /api/properties/:propertyId/renewal-plan`
- `GET /api/properties/:propertyId/quotes`
- `POST /api/properties/:propertyId/quote-requests`

These are interface targets, not implemented production endpoints yet.
