# Home Renewal Plan™ Engine

The Home Renewal Plan turns a completed home audit into a recurring five-year property-care cycle.

## Lifecycle

Digital Home Audit → Renewal Plan → maintenance tasks → quote/service job → evidence → completion → next five-year review.

## API

- `POST /api/v1/homeowner/renewal-plans` creates one active plan for an owned property.
- `GET /api/v1/homeowner/properties/:propertyId/renewal-plan` retrieves the owner-scoped plan.
- `GET /api/v1/homeowner/renewal-plans/:planId/tasks` lists plan tasks.
- `POST /api/v1/homeowner/renewal-plans/:planId/tasks` creates a maintenance task.
- `PATCH /api/v1/homeowner/renewal-tasks/:taskId/status` advances a task and can associate a service job.

## Five-year rule

The MVP stores a fixed five-year cycle and calculates the next review date from the plan start date. It is a planning/maintenance product feature, not an insurance policy and not a guarantee of property-value growth.

## Health baseline

`homeHealthAtStart` is an optional 0–100 baseline supplied by the audit workflow. It is a product metric, not a valuation, underwriting decision, certification or guarantee.

## Production requirements

Production rollout still requires authenticated identity, transactional plan/task writes, audit logging, reminders/notifications, supplier job integration, POPIA controls, operational monitoring and legal review of the commercial Home Renewal Plan terms.
