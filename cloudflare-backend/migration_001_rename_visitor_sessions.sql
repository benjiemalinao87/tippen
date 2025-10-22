-- Migration: Rename visitor_sessions to visitors and fix schema
-- This makes it clearer that we're tracking all website visitors, not just video sessions

-- Create new visitors table with better naming and optional foreign key
CREATE TABLE IF NOT EXISTS visitors (
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
  
  -- Video session fields (nullable - only filled if visitor accepts video)
  video_session_id TEXT,
  video_invited_at TIMESTAMP,
  video_accepted_at TIMESTAMP,
  video_status TEXT CHECK (video_status IN ('invited', 'accepted', 'declined', 'completed', NULL))
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_visitor_api_key ON visitors(api_key);
CREATE INDEX IF NOT EXISTS idx_visitor_id ON visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_last_seen ON visitors(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_status ON visitors(video_status);

-- Copy data from visitor_sessions to visitors
INSERT INTO visitors (id, api_key, visitor_id, company, location, last_role, website, page_views, first_seen_at, last_seen_at, total_time_seconds)
SELECT id, api_key, visitor_id, company, location, last_role, website, page_views, first_seen_at, last_seen_at, total_time_seconds
FROM visitor_sessions;

-- Drop old table
DROP TABLE visitor_sessions;

