# Billing & Subscription Architecture

The Lifestyle Hub billing layer records Home Renewal Plan subscriptions and payment transactions without coupling business records to a gateway.

## Flow

Homeowner → Renewal Plan → subscription request → payment provider adapter → payment transaction → provider webhook/event → subscription status.

## Current provider boundary

RemotePay is the intended payment integration option, with PayGate retained as an additional provider boundary. The repository currently contains a provider-neutral adapter and does **not** make live gateway calls by default.

`PAYMENTS_ENABLED` must remain disabled until provider onboarding, credentials, sandbox verification, webhook signature validation, reconciliation and applicable legal/compliance review are complete.

## Invariants

- Amounts are stored in minor currency units (ZAR cents).
- Every transaction has a unique business reference and idempotency key.
- Provider references are external identifiers, never primary business identifiers.
- Payment events are retained separately for idempotent webhook processing and auditability.
- A property can have at most one active/pending/past-due/paused subscription in the current schema.
- Payment success does not by itself represent insurance coverage or a guarantee of property-value growth.

## Production TODO

1. Implement the selected gateway adapter against official provider documentation.
2. Verify signed callbacks/webhooks and persist raw event references safely.
3. Add retry-safe reconciliation and settlement handling.
4. Add receipts, refunds, chargeback/dispute handling where applicable.
5. Add recurring billing scheduler/provider subscription lifecycle synchronization.
6. Complete POPIA, payment-regulatory, tax, consumer and contract review before production activation.
