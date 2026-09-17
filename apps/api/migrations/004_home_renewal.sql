CREATE TABLE IF NOT EXISTS renewal_plans (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('DRAFT','ACTIVE','PAUSED','COMPLETED','CANCELLED')),
  cycle_years INTEGER NOT NULL DEFAULT 5 CHECK (cycle_years = 5),
  start_date TIMESTAMPTZ NOT NULL,
  next_review_date TIMESTAMPTZ NOT NULL,
  home_health_at_start INTEGER CHECK (home_health_at_start BETWEEN 0 AND 100),
  source_audit_id TEXT REFERENCES home_audits(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS renewal_tasks (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES renewal_plans(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('LOW','MEDIUM','URGENT')),
  status TEXT NOT NULL CHECK (status IN ('PLANNED','QUOTING','SCHEDULED','IN_PROGRESS','COMPLETED','SKIPPED')),
  due_date TIMESTAMPTZ,
  service_job_id TEXT REFERENCES service_jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS renewal_plans_owner_property_idx ON renewal_plans(owner_id, property_id);
CREATE INDEX IF NOT EXISTS renewal_tasks_plan_idx ON renewal_tasks(plan_id);
CREATE INDEX IF NOT EXISTS renewal_tasks_due_idx ON renewal_tasks(owner_id, due_date);
