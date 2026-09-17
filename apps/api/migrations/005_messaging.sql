CREATE TABLE IF NOT EXISTS notification_messages (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  property_id TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('EMAIL','WHATSAPP','SMS')),
  recipient TEXT NOT NULL,
  template TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('QUEUED','SENT','FAILED')),
  provider_message_id TEXT,
  idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_code TEXT,
  UNIQUE(owner_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS idx_notification_messages_owner ON notification_messages(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_messages_property ON notification_messages(property_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_messages_status ON notification_messages(status, created_at);
