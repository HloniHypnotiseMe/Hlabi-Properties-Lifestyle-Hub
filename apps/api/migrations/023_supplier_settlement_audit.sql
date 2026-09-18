CREATE TABLE IF NOT EXISTS supplier_settlement_audit_events(
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 settlement_id UUID NOT NULL REFERENCES supplier_settlements(id) ON DELETE CASCADE,
 actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
 event_type TEXT NOT NULL,
 payload JSONB NOT NULL DEFAULT '{}'::jsonb,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS supplier_settlement_audit_settlement_idx ON supplier_settlement_audit_events(settlement_id,created_at DESC);
