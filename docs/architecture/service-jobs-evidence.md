# Service Jobs & Evidence

The connected-home workflow now supports the transition from an accepted supplier quote into a tracked service job, followed by status updates and evidence records.

## Flow

Audit finding → quote request → supplier quote → homeowner selects quote → service job → scheduled/in progress → evidence → completed.

## API

- `POST /api/v1/homeowner/quote-requests/:requestId/select` creates a job from an owner-scoped selectable quote and marks that quote accepted.
- `GET /api/v1/homeowner/properties/:propertyId/jobs` lists jobs for the authenticated homeowner's property.
- `GET /api/v1/homeowner/jobs/:jobId` returns one owner-scoped job.
- `PATCH /api/v1/homeowner/jobs/:jobId/status` updates job lifecycle status.
- `POST /api/v1/homeowner/jobs/:jobId/evidence` records evidence metadata and a storage key.
- `GET /api/v1/homeowner/jobs/:jobId/evidence` lists evidence for an owner-scoped job.

## Evidence boundary

The API stores a storage key and metadata; it does not upload binary files. A production object-storage adapter and signed upload/download URLs must be added before real photos or documents are accepted.

Evidence types: BEFORE, PROGRESS, AFTER, DOCUMENT.

Production requirements remain: authenticated supplier actions, object-storage access controls, malware/content checks where appropriate, audit logs, retention policy, POPIA controls, and transactional notification workflows.
