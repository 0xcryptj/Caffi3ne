-- ─── Auth prep: users + API keys ────────────────────────────────────────────
-- Run this in the Supabase SQL editor when ready to enable real key enforcement.

-- Users table (prep for Supabase Auth integration)
CREATE TABLE IF NOT EXISTS users (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  tier        TEXT NOT NULL DEFAULT 'free',  -- 'free' | 'pro'
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key           TEXT UNIQUE NOT NULL,
  email         TEXT NOT NULL,
  name          TEXT NOT NULL,
  tier          TEXT NOT NULL DEFAULT 'demo',  -- 'demo' | 'pro'
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  request_count INTEGER DEFAULT 0,
  last_used_at  TIMESTAMPTZ,
  revoked       BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Usage events (for billing/rate-limit tracking)
CREATE TABLE IF NOT EXISTS usage_events (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint   TEXT NOT NULL,
  status     INTEGER NOT NULL,  -- HTTP status code
  ts         TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_key   ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_email ON api_keys(email);
CREATE INDEX IF NOT EXISTS idx_usage_events_key_ts ON usage_events(api_key_id, ts);

-- RLS policies (enable after Supabase Auth is wired up)
-- ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users    ENABLE ROW LEVEL SECURITY;
