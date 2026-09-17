CREATE TABLE IF NOT EXISTS journey_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  journey_type TEXT NOT NULL CHECK (journey_type IN ('BUYER','SELLER','INVESTOR')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','PAUSED','COMPLETED','CANCELLED')),
  goals JSONB NOT NULL DEFAULT '{}'::jsonb,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS journey_profiles_user_idx ON journey_profiles(user_id);
CREATE INDEX IF NOT EXISTS journey_profiles_type_idx ON journey_profiles(journey_type);
CREATE TABLE IF NOT EXISTS journey_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id UUID NOT NULL REFERENCES journey_profiles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS journey_events_journey_idx ON journey_events(journey_id, created_at DESC);
CREATE INDEX IF NOT EXISTS journey_events_user_idx ON journey_events(user_id, created_at DESC);
