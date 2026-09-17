# Academy assessments and simulations

The Academy now has a first assessment/evidence layer alongside course enrolment and AI tutoring.

## Knowledge assessments

- Multiple-choice items are scored automatically.
- Passing threshold is defined by the assessment.
- Learner attempts are persisted in PostgreSQL when `DATABASE_URL` is configured.
- Correct answers are never returned by the learner-facing assessment listing endpoint.

## Simulations

Scenario assessments accept learner responses as evidence and return `NEEDS_REVIEW`. They expose a rubric for a future authorised reviewer/evaluator workflow rather than pretending that an AI or keyword heuristic is a professional assessor.

## Boundaries

Assessment completion is a product workflow and evidence record. It is not a PPRA registration, qualification, licence, designation, accreditation, employment guarantee, or legal certification. Any external qualification or regulatory requirement must be verified with the relevant authoritative body.

## Next

1. Add authorised Academy reviewer roles and review workflow.
2. Add richer assessment banks and attempt limits/versioning.
3. Add learner evidence attachments and simulation artefacts.
4. Connect completion rules to Academy refund eligibility terms only after the commercial/legal rules are finalised.
