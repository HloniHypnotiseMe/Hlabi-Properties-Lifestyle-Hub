ALTER TABLE service_jobs ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;
ALTER TABLE service_jobs ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE service_jobs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS job_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES service_jobs(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('BEFORE','PROGRESS','AFTER','DOCUMENT')),
  storage_key TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS job_evidence_job_id_idx ON job_evidence(job_id);
CREATE INDEX IF NOT EXISTS job_evidence_owner_id_idx ON job_evidence(owner_id);
CREATE INDEX IF NOT EXISTS job_evidence_property_id_idx ON job_evidence(property_id);

CREATE TABLE IF NOT EXISTS job_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES service_jobs(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  event_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS job_events_job_id_idx ON job_events(job_id);
CREATE INDEX IF NOT EXISTS job_events_owner_id_idx ON job_events(owner_id);
