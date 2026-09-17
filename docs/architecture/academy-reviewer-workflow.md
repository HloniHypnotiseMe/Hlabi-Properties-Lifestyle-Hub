# Academy reviewer workflow

The Academy assessment layer separates learner activity from human review.

## Flow

1. Learner discovers assessments within their enrollment.
2. Knowledge assessments may be objectively scored automatically.
3. Simulation/short-response attempts enter `NEEDS_REVIEW`.
4. An authenticated `ACADEMY_REVIEWER` or `ADMIN` retrieves the review queue.
5. Reviewer retrieves an individual attempt and submits a score plus feedback.
6. The attempt becomes `PASSED` or `FAILED` and records reviewer identity and review time.

## Security boundary

- Learners can only read their own enrollment and attempts.
- Learners cannot access reviewer queue endpoints.
- Learners cannot review their own attempts.
- Reviewer endpoints require the dedicated Academy reviewer role or ADMIN.
- Production authentication must establish this role through the real identity provider; the development header adapter is not production authentication.

## Product boundary

Assessment completion is an internal learning/evidence workflow. It does not itself confer a statutory qualification, PPRA registration, licence, designation, accreditation or employment status. Any external qualification or regulatory outcome must be handled by the authorised provider/process.

## Next step

Add reviewer UI, assessment-attempt audit events, reviewer assignment/locking, and evidence export before connecting the Academy completion pathway to any external qualification or refund workflow.
