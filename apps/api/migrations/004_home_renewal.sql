ALTER TABLE renewal_plans
  ADD COLUMN IF NOT EXISTS cycle_years INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS home_health_at_start INTEGER,
  ADD COLUMN IF NOT EXISTS source_audit_id UUID REFERENCES audits(id) ON DELETE SET NULL;

ALTER TABLE renewal_plans
  ADD CONSTRAINT renewal_plans_cycle_years_five CHECK (cycle_years = 5),
  ADD CONSTRAINT renewal_plans_home_health_range CHECK (home_health_at_start IS NULL OR home_health_at_start BETWEEN 0 AND 100);

CREATE TABLE IF NOT EXISTS renewal_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES renewal_plans(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('LOW','MEDIUM','URGENT')),
  status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED','QUOTING','SCHEDULED','IN_PROGRESS','COMPLETED','SKIPPED')),
  due_date TIMESTAMPTZ,
  service_job_id UUID REFERENCES service_jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS renewal_plans_owner_property_idx ON renewal_plans(owner_id, property_id);
CREATE INDEX IF NOT EXISTS renewal_tasks_plan_idx ON renewal_tasks(plan_id);
CREATE INDEX IF NOT EXISTS renewal_tasks_due_idx ON renewal_tasks(owner_id, due_date);

DROP TRIGGER IF EXISTS renewal_tasks_set_updated_at ON renewal_tasks;
CREATE TRIGGER renewal_tasks_set_updated_at BEFORE UPDATE ON renewal_tasks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
