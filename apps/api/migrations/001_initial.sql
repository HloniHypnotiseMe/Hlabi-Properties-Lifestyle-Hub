CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_subject TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('HOMEOWNER','BUYER','SELLER','INVESTOR','AGENT','SUPPLIER','ADMIN')),
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  nickname TEXT NOT NULL,
  address JSONB NOT NULL DEFAULT '{}'::jsonb,
  property_type TEXT NOT NULL CHECK (property_type IN ('HOUSE','APARTMENT','TOWNHOUSE','OTHER')),
  lifecycle TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS properties_owner_id_idx ON properties(owner_id);

CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('DRAFT','IN_PROGRESS','COMPLETED','REVIEW_REQUIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audits_owner_id_idx ON audits(owner_id);
CREATE INDEX IF NOT EXISTS audits_property_id_idx ON audits(property_id);

CREATE TABLE IF NOT EXISTS audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  area TEXT NOT NULL,
  grade TEXT NOT NULL CHECK (grade IN ('GREEN','AMBER','RED')),
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('LOW','MEDIUM','URGENT')),
  recommended_action TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (audit_id, area)
);

CREATE TABLE IF NOT EXISTS renewal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'DRAFT',
  started_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS renewal_plans_owner_id_idx ON renewal_plans(owner_id);

CREATE TABLE IF NOT EXISTS supplier_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  audit_id UUID REFERENCES audits(id),
  supplier_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'REQUESTED',
  amount_cents BIGINT,
  currency CHAR(3) NOT NULL DEFAULT 'ZAR',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS supplier_quotes_owner_id_idx ON supplier_quotes(owner_id);
CREATE INDEX IF NOT EXISTS supplier_quotes_property_id_idx ON supplier_quotes(property_id);

CREATE TABLE IF NOT EXISTS service_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  supplier_id UUID REFERENCES users(id),
  quote_id UUID REFERENCES supplier_quotes(id),
  status TEXT NOT NULL DEFAULT 'REQUESTED',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS service_jobs_owner_id_idx ON service_jobs(owner_id);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  document_type TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS documents_owner_id_idx ON documents(owner_id);

CREATE TABLE IF NOT EXISTS activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  owner_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  event_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS activity_events_owner_id_idx ON activity_events(owner_id);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS properties_set_updated_at ON properties;
CREATE TRIGGER properties_set_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS audits_set_updated_at ON audits;
CREATE TRIGGER audits_set_updated_at BEFORE UPDATE ON audits FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS renewal_plans_set_updated_at ON renewal_plans;
CREATE TRIGGER renewal_plans_set_updated_at BEFORE UPDATE ON renewal_plans FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS supplier_quotes_set_updated_at ON supplier_quotes;
CREATE TRIGGER supplier_quotes_set_updated_at BEFORE UPDATE ON supplier_quotes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS service_jobs_set_updated_at ON service_jobs;
CREATE TRIGGER service_jobs_set_updated_at BEFORE UPDATE ON service_jobs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
