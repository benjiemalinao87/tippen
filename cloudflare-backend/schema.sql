-- Tippen D1 Database Schema
-- API Keys Management

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key TEXT UNIQUE NOT NULL,
  key_type TEXT NOT NULL CHECK (key_type IN ('client', 'demo', 'test')),
  client_name TEXT,
  website TEXT,
  backend_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'revoked')),
  usage_count INTEGER DEFAULT 0,
  notes TEXT
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_status ON api_keys(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON api_keys(created_at DESC);

-- Visitor tracking history (optional, for analytics)
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  company TEXT,
  location TEXT,
  last_role TEXT,
  website TEXT,
  page_views INTEGER DEFAULT 0,
  first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_time_seconds INTEGER DEFAULT 0,
  FOREIGN KEY (api_key) REFERENCES api_keys(api_key)
);

-- Index for visitor lookups
CREATE INDEX IF NOT EXISTS idx_visitor_api_key ON visitor_sessions(api_key);
CREATE INDEX IF NOT EXISTS idx_visitor_id ON visitor_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_last_seen ON visitor_sessions(last_seen_at DESC);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_api_keys_timestamp 
AFTER UPDATE ON api_keys
BEGIN
  UPDATE api_keys SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

