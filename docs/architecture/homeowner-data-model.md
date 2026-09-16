# Homeowner Property Data Model

## Purpose

This model is the first domain contract for the Hlabi Properties Lifestyle Hub homeowner experience. It separates property lifecycle data from presentation so the frontend can later consume an authenticated API without redesigning the dashboard.

## Core entities

- **Property** — the owned/managed property and its lifecycle state.
- **HomeAudit** — structured inspection information and findings by property area.
- **HomeAuditFinding** — a condition observation, priority and recommended action.
- **RenewalPlan** — a five-year planning cycle linked to one property.
- **RenewalTask** — an actionable maintenance or upgrade item within the plan.
- **SupplierQuote** — a quote request/response attached to a renewal task.
- **ActivityEvent** — an auditable timeline event for the property journey.

## Lifecycle

`draft → onboarding → audited → renewal-ready → active-plan → maintenance → sale-preparation → archived`

A property may move between operational states based on completed actions. The lifecycle is a domain concept, not a promise of insurance coverage, property-value growth or service availability.

## Audit areas

The initial taxonomy covers roof, structure, electrical, plumbing, exterior, interior, security, grounds and compliance. The backend can extend this without changing the homeowner dashboard contract.

## Production boundary

The current frontend repository contains a **demo adapter only**. Production data must be retrieved from an authenticated backend and must not be embedded in frontend source code. Authentication, authorization, audit logging, document storage, supplier verification, payments and notifications are separate service concerns.

## Security / POPIA design requirements

- Apply least-privilege access by role and property relationship.
- Keep credentials and API secrets outside source control.
- Record material changes to property, audit, plan, quote and payment records in an audit trail.
- Minimise personal information collected for each workflow.
- Define retention and deletion rules before production launch.
- Encrypt sensitive data in transit and at rest where appropriate.
- Do not expose supplier, homeowner or property documents to unauthorised users.
