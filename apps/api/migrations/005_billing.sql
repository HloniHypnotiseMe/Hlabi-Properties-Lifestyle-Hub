CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  plan_code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING','ACTIVE','PAST_DUE','PAUSED','CANCELLED','EXPIRED')),
  currency CHAR(3) NOT NULL DEFAULT 'ZAR',
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  interval TEXT NOT NULL CHECK (interval IN ('MONTH','YEAR')),
  provider TEXT NOT NULL,
  provider_customer_ref TEXT,
  provider_subscription_ref TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS subscriptions_owner_property_idx ON subscriptions(owner_id, property_id);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_active_property_idx ON subscriptions(property_id) WHERE status IN ('PENDING','ACTIVE','PAST_DUE','PAUSED');

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  provider TEXT NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  provider_transaction_ref TEXT,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency CHAR(3) NOT NULL DEFAULT 'ZAR',
  status TEXT NOT NULL CHECK (status IN ('PENDING','SUCCEEDED','FAILED','REFUNDED')),
  failure_code TEXT,
  failure_reason TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payment_transactions_owner_idx ON payment_transactions(owner_id, created_at DESC);

CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  provider_event_ref TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS subscriptions_set_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_set_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS payment_transactions_set_updated_at ON payment_transactions;
CREATE TRIGGER payment_transactions_set_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
