CREATE TABLE IF NOT EXISTS reputation_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL,
  property_id UUID NOT NULL,
  job_id UUID,
  supplier_id TEXT,
  agent_id TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,
  status TEXT NOT NULL CHECK (status IN ('PENDING','PUBLISHED','HIDDEN','FLAGGED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reputation_reviews_property_idx ON reputation_reviews(property_id,owner_id,created_at DESC);
CREATE INDEX IF NOT EXISTS reputation_reviews_supplier_idx ON reputation_reviews(supplier_id,status,created_at DESC);
CREATE INDEX IF NOT EXISTS reputation_reviews_job_idx ON reputation_reviews(job_id);
