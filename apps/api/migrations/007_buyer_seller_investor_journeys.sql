CREATE TABLE IF NOT EXISTS buyer_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT NOT NULL UNIQUE,
  preferred_suburb TEXT, city TEXT, province TEXT, property_types TEXT[] NOT NULL DEFAULT '{}',
  min_budget_cents BIGINT, max_budget_cents BIGINT, bedrooms INTEGER,
  financing_status TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (financing_status IN ('CASH','PRE_APPROVED','NEEDS_FINANCE','UNKNOWN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS seller_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT NOT NULL, property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  target_sale_date TIMESTAMPTZ, reason TEXT, readiness TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (readiness IN ('NOT_STARTED','PREPARING','READY_TO_LIST')),
  notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(user_id, property_id)
);
CREATE TABLE IF NOT EXISTS investor_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT NOT NULL UNIQUE, target_area TEXT,
  strategy TEXT NOT NULL CHECK (strategy IN ('LONG_TERM_RENTAL','FLIP','DEVELOPMENT','MIXED')),
  min_budget_cents BIGINT, max_budget_cents BIGINT, target_yield_percent NUMERIC(5,2),
  risk_profile TEXT NOT NULL CHECK (risk_profile IN ('CONSERVATIVE','BALANCED','GROWTH')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS seller_journeys_property_idx ON seller_journeys(property_id);
CREATE INDEX IF NOT EXISTS investor_journeys_strategy_idx ON investor_journeys(strategy);
