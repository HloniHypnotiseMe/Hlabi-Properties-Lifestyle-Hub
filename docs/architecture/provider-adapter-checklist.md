# Provider Adapter Checklist

Before any provider moves from foundation to active:

- [ ] Confirm repository/license permits intended commercial use.
- [ ] Pin a reviewed version/commit rather than depending on `latest` in production.
- [ ] Run dependency and vulnerability review.
- [ ] Define API timeout, retry and idempotency behavior.
- [ ] Define authentication and webhook verification.
- [ ] Define data minimisation and retention behavior.
- [ ] Add structured logs and provider correlation IDs.
- [ ] Add health/readiness checks.
- [ ] Add unit tests and sandbox/integration tests.
- [ ] Document rollback and provider replacement procedure.
- [ ] Keep credentials out of the browser and Git history.
