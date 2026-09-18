CREATE TABLE IF NOT EXISTS investor_portfolio_items (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, listing_id UUID NOT NULL REFERENCES property_listings(id) ON DELETE CASCADE,
 status TEXT NOT NULL CHECK(status IN ('WATCHLIST','DUE_DILIGENCE','OFFERED','ACQUIRED','PASSED')), notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(investor_id,listing_id)
);
CREATE INDEX IF NOT EXISTS investor_portfolio_items_investor_idx ON investor_portfolio_items(investor_id,updated_at DESC);
