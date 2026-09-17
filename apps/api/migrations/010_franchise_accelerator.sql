CREATE TABLE IF NOT EXISTS franchise_accelerator_profiles (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  stage TEXT NOT NULL CHECK (stage IN ('ACADEMY','AGENT','OFFICE','FRANCHISE')),
  status TEXT NOT NULL CHECK (status IN ('IN_PROGRESS','READY','BLOCKED','APPROVED')),
  checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
  territory TEXT,
  office_name TEXT,
  franchise_opportunity_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_franchise_accelerator_user ON franchise_accelerator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_franchise_accelerator_stage ON franchise_accelerator_profiles(stage,status);
