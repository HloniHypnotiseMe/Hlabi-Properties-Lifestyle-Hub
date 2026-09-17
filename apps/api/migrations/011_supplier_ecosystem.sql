CREATE TABLE IF NOT EXISTS supplier_ecosystem_profiles (
  supplier_id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SUBMITTED','VERIFIED','SUSPENDED')),
  business_profile_complete BOOLEAN NOT NULL DEFAULT FALSE,
  service_areas_complete BOOLEAN NOT NULL DEFAULT FALSE,
  categories_complete BOOLEAN NOT NULL DEFAULT FALSE,
  evidence_complete BOOLEAN NOT NULL DEFAULT FALSE,
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  reputation_score NUMERIC(3,2),
  completed_jobs INTEGER NOT NULL DEFAULT 0 CHECK (completed_jobs >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_supplier_ecosystem_status ON supplier_ecosystem_profiles(status);
