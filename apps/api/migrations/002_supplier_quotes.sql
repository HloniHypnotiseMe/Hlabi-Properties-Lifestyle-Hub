CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}',
  service_areas TEXT[] NOT NULL DEFAULT '{}',
  verified BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS suppliers_active_idx ON suppliers(active);
CREATE INDEX IF NOT EXISTS suppliers_categories_idx ON suppliers USING GIN(categories);

CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  audit_id UUID REFERENCES audits(id),
  area TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('LOW','MEDIUM','URGENT')),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','QUOTING','SELECTED','CANCELLED','COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quote_requests_owner_id_idx ON quote_requests(owner_id);
CREATE INDEX IF NOT EXISTS quote_requests_property_id_idx ON quote_requests(property_id);

CREATE TABLE IF NOT EXISTS quote_request_suppliers (
  quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (quote_request_id, supplier_id)
);

ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS quote_request_id UUID REFERENCES quote_requests(id);
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ;
ALTER TABLE supplier_quotes ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS supplier_quotes_request_id_idx ON supplier_quotes(quote_request_id);

DROP TRIGGER IF EXISTS suppliers_set_updated_at ON suppliers;
CREATE TRIGGER suppliers_set_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS quote_requests_set_updated_at ON quote_requests;
CREATE TRIGGER quote_requests_set_updated_at BEFORE UPDATE ON quote_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();
