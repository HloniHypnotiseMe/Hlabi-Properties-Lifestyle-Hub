CREATE TABLE IF NOT EXISTS agent_property_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agent_staff(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','REVOKED')),
  granted_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(agent_id, property_id)
);
CREATE INDEX IF NOT EXISTS idx_agent_property_access_owner ON agent_property_access(owner_id, property_id);
CREATE INDEX IF NOT EXISTS idx_agent_property_access_agent ON agent_property_access(agent_id, status);
DROP TRIGGER IF EXISTS trg_agent_property_access_updated_at ON agent_property_access;
CREATE TRIGGER trg_agent_property_access_updated_at BEFORE UPDATE ON agent_property_access FOR EACH ROW EXECUTE FUNCTION set_updated_at();
