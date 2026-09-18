CREATE TABLE IF NOT EXISTS property_listings (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
 seller_id UUID NOT NULL REFERENCES users(id),
 status TEXT NOT NULL CHECK(status IN ('DRAFT','READY_TO_LIST','LISTED','PAUSED','SOLD','WITHDRAWN')),
 title TEXT NOT NULL,
 description TEXT NOT NULL,
 asking_price_cents BIGINT,
 bedrooms INTEGER CHECK(bedrooms IS NULL OR bedrooms>=0),
 bathrooms NUMERIC(4,1) CHECK(bathrooms IS NULL OR bathrooms>=0),
 features JSONB NOT NULL DEFAULT '[]'::jsonb,
 published_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(property_id,seller_id)
);
CREATE INDEX IF NOT EXISTS property_listings_status_idx ON property_listings(status,published_at DESC);
CREATE INDEX IF NOT EXISTS property_listings_property_idx ON property_listings(property_id);
DROP TRIGGER IF EXISTS property_listings_set_updated_at ON property_listings;
CREATE TRIGGER property_listings_set_updated_at BEFORE UPDATE ON property_listings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
