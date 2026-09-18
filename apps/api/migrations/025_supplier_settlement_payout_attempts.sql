CREATE TABLE IF NOT EXISTS supplier_settlement_payout_attempts(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 settlement_id UUID NOT NULL REFERENCES supplier_settlements(id) ON DELETE CASCADE,
 attempt_no INTEGER NOT NULL CHECK(attempt_no>0),
 idempotency_key TEXT NOT NULL UNIQUE,
 provider TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('PROCESSING','PAID','FAILED')),
 payout_reference TEXT,
 failure_reason TEXT,
 started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 completed_at TIMESTAMPTZ,
 UNIQUE(settlement_id,attempt_no)
);
CREATE INDEX IF NOT EXISTS supplier_settlement_payout_attempts_settlement_idx ON supplier_settlement_payout_attempts(settlement_id,attempt_no DESC);
