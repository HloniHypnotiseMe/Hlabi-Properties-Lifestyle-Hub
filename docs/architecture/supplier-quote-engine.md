# Supplier Quote Engine

The supplier quote layer connects homeowner maintenance findings to a controlled supplier network.

## Flow

1. Homeowner identifies work from a Digital Home Audit.
2. API verifies the homeowner owns the property.
3. A quote request is created with title, description, area and priority.
4. Only active, verified suppliers matching the requested category are invited.
5. Suppliers submit structured quotes in ZAR (amount is optional until pricing is known).
6. Homeowner retrieves quote requests and quotes scoped to their own property/account.
7. Quote selection and service-job execution are the next workflow stage.

## Safety and commercial boundaries

- Supplier verification is a platform state, not a claim of professional accreditation.
- Quote amounts are supplier-submitted and are not guarantees of final cost.
- No insurance coverage, underwriting decision or property-value guarantee is implied.
- Production supplier onboarding must add identity verification, business verification, service-area checks, terms, privacy controls and audit logging.
- Production authentication must replace the development identity adapter.
