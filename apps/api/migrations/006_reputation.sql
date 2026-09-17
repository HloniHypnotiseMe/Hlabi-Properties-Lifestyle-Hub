CREATE TABLE IF NOT EXISTS reputation_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  job_id UUID REFERENCES service_jobs(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES agent_staff(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PUBLISHED','HIDDEN','FLAGGED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS reputation_reviews_property_idx ON reputation_reviews(property_id,created_at DESC);
CREATE INDEX IF NOT EXISTS reputation_reviews_owner_idx ON reputation_reviews(owner_id,created_at DESC);
DROP TRIGGER IF EXISTS reputation_reviews_updated_at ON reputation_reviews;
CREATE TRIGGER reputation_reviews_updated_at BEFORE UPDATE ON reputation_reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();
