# Persistence and Authorization Foundation

The API now has an explicit PostgreSQL persistence adapter and a migration-managed schema.

## Persistence

- `apps/api/migrations/0000_migrations.sql` creates migration tracking.
- `apps/api/migrations/001_initial.sql` defines users, properties, audits, audit findings, renewal plans, supplier quotes, service jobs, documents and activity events.
- `apps/api/src/postgresRepository.ts` implements the existing homeowner repository contract with PostgreSQL.
- `DATABASE_URL` selects PostgreSQL at runtime; without it, the development memory repository remains available.
- Run `npm run migrate` from `apps/api` against the configured database before starting the production API.

## Authorization invariant

Every homeowner property and audit read/write is scoped by the authenticated principal's `userId`. The API does not accept an owner ID from the request body or URL for authorization decisions.

## Authentication

`apps/api/src/authentication.ts` defines the production adapter boundary. `DevelopmentAuthenticationProvider` is intentionally opt-in through `AUTH_MODE=development`. All other modes use `UnconfiguredAuthenticationProvider`, which denies access until a verified identity/session adapter is installed.

A future OIDC/JWT/session adapter must validate issuer, audience, signature/session integrity, expiry and role claims before producing an `AuthenticatedPrincipal`.

## Security requirements before production

- Use a verified identity provider; never enable development auth in production.
- Store `DATABASE_URL` and provider credentials in deployment secrets.
- Apply least-privilege database credentials and encrypted connections where supported.
- Add request correlation IDs, audit logging, rate limits and error monitoring.
- Complete POPIA/data-retention and access-control review.
- Add automated migration, repository and authorization tests.
