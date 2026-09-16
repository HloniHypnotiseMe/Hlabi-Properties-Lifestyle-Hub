# Digital Home Audit

## Purpose

The Digital Home Audit is the homeowner's first structured entry point into the Hlabi Home Renewal Plan™. It creates a preliminary condition picture before professional inspection, supplier quoting or a renewal plan is finalised.

## MVP flow

1. Homeowner enters the Lifestyle Hub.
2. Selects a property.
3. Completes nine guided areas: roof, structure, electrical, plumbing, exterior, interior, security, grounds, and documents/compliance.
4. Each area receives a GREEN / AMBER / RED self-assessment.
5. The Hub calculates a preliminary health indicator.
6. Findings become actionable maintenance recommendations.
7. Future backend services persist the audit and can route relevant work to verified suppliers.

## Guardrails

- The self-assessment is not a professional inspection.
- It does not establish insurance cover, underwriting acceptance or a claim outcome.
- It does not guarantee property-value improvement.
- Cost ranges should only be shown once based on verified market/supplier data.
- Professional verification is required for safety, structural, compliance and other regulated/high-risk matters.

## Future workflow

`Self-assessment → Professional verification → Findings → Quote request → Supplier selection → Job → Evidence → Renewal plan → Five-year review`

The current implementation is deliberately demo-only. Production persistence, identity, authorisation, document storage, supplier matching and payment flows belong behind the API boundary.
