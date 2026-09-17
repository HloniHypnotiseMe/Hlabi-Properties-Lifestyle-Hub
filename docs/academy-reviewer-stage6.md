# Academy Reviewer — Stage 6

Stage 6 adds the reviewer-facing workspace on top of the authorised reviewer API introduced in PR #29.

## Scope

- Reviewer queue backed by `/api/v1/academy/reviewer/queue`.
- Secure attempt retrieval through `/api/v1/academy/reviewer/attempts/:attemptId`.
- Reviewer scoring, outcome and feedback through the existing review endpoint.
- Review-state display and a compact audit trail showing submission and review events.
- Evidence export as `hlabi.academy.evidence.v1` JSON.

## Security boundary

The UI does not grant reviewer access. The API remains authoritative and requires `ACADEMY_REVIEWER` or `ADMIN`. Learner-facing attempt retrieval remains user-scoped, while reviewer retrieval uses the existing reviewer-only endpoint.

## Evidence boundary

The export is an evidence record, not a qualification, accreditation or regulatory certificate. Production identity-provider role mapping remains required.

## CI

No CI result is claimed unless a GitHub Actions workflow run is observed for the resulting commit or pull request.
