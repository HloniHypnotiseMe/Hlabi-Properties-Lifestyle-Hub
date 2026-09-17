# Reputation Management

The Lifestyle Hub reputation layer gives homeowners a structured way to record feedback about completed property services. Reviews are property-scoped and are persisted with optional links to a service job, supplier, or agent.

## Review lifecycle

`PENDING → PUBLISHED | HIDDEN | FLAGGED`

New homeowner reviews enter `PENDING`. Publication/moderation is intentionally separated from submission so the platform can add moderation controls before public display.

## Data captured

- 1–5 rating
- optional title and comment
- property and homeowner owner boundary
- optional service job, supplier and agent references
- status and timestamps

## API foundation

The repository and route layer are prepared for:

- `POST /api/v1/homeowner/reputation/reviews`
- `GET /api/v1/homeowner/properties/:propertyId/reputation`
- `GET /api/v1/homeowner/properties/:propertyId/reputation/reviews`

The current implementation is deliberately owner-scoped. Public supplier/agent reputation profiles, moderation administration, review invitations, and automated reputation workflows should be added only after the core moderation and privacy model is established.

## AI boundary

The Reputation Assistant may draft review-request messages, summarize published feedback, and identify recurring themes. It must not fabricate reviews, alter ratings, publish feedback, or send communications without the existing permission and approval controls.

## Production requirements

Before public reputation scores are exposed, add moderation audit trails, abuse/report handling, consent and privacy controls, review authenticity rules, rate limiting, notification templates, and explicit policy for removal/disputes.
