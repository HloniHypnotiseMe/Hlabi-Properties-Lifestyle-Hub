# Messaging & Notifications

The Lifestyle Hub uses a provider-neutral notification boundary for Email, WhatsApp and SMS.

## Supported channels

- Email → BillionMail adapter boundary
- WhatsApp → Whatomate adapter boundary
- SMS → Arkesel adapter boundary

## Lifecycle

`Domain event → notification intent → idempotency check → provider adapter → delivery result → message ledger`

The ledger is property/owner scoped and records provider IDs, delivery state and failure codes.

## Safety and production boundaries

- Providers are disabled by default until credentials and provider onboarding are complete.
- Outbound sends must use explicit templates and validated payloads.
- Idempotency keys prevent duplicate sends during retries.
- Production webhook signatures and delivery callbacks must be verified before they mutate delivery state.
- Personal data should be minimized and retained according to POPIA and the platform retention policy.
- Payment receipts, payment reminders and renewal notices must not imply insurance coverage or a guaranteed property-value outcome.
- Long-running or bulk messaging should move to an asynchronous worker/queue rather than blocking API requests.
