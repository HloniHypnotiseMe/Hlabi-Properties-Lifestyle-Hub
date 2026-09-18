CREATE TABLE IF NOT EXISTS investor_diligence_evidence (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
 kind TEXT NOT NULL CHECK(kind IN ('PROPERTY_FACTS','OWNERSHIP','OCCUPANCY','RENTAL_INCOME','OPERATING_EXPENSES','COMPLIANCE','VALUATION','DOCUMENT')),
 status TEXT NOT NULL CHECK(status IN ('MISSING','CAPTURED','VERIFIED')),
 label TEXT NOT NULL,
 value TEXT,
 source TEXT,
 notes TEXT,
 captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 verified_at TIMESTAMPTZ,
 verified_by UUID REFERENCES users(id),
 UNIQUE(investor_id,listing_id,kind)
);
CREATE INDEX IF NOT EXISTS investor_diligence_evidence_idx ON investor_diligence_evidence(investor_id,listing_id,kind);

ALTER TABLE investor_diligence_evidence ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id);
