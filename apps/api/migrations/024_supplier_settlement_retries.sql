ALTER TABLE supplier_settlements ADD COLUMN IF NOT EXISTS payout_attempts INTEGER NOT NULL DEFAULT 0 CHECK(payout_attempts>=0);
ALTER TABLE supplier_settlements ADD COLUMN IF NOT EXISTS last_payout_attempt_at TIMESTAMPTZ;
ALTER TABLE supplier_settlements ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;
ALTER TABLE supplier_settlements ADD COLUMN IF NOT EXISTS payout_idempotency_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS supplier_settlements_payout_idempotency_idx ON supplier_settlements(payout_idempotency_key) WHERE payout_idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS supplier_settlements_retry_idx ON supplier_settlements(status,next_retry_at);
