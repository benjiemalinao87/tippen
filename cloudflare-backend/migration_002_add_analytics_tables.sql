-- Migration: Add analytics tables for dashboard metrics
-- This enables real-time tracking of video calls, connections, and performance metrics

-- Video Call Sessions Table
-- Tracks each video call attempt, success/failure, duration, and outcome
CREATE TABLE IF NOT EXISTS video_calls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  session_id TEXT UNIQUE NOT NULL,

  -- Call metadata
  company TEXT,
  visitor_role TEXT,
  initiated_by TEXT DEFAULT 'admin',

  -- Call status tracking
  status TEXT NOT NULL CHECK (status IN ('invited', 'connecting', 'connected', 'completed', 'failed', 'declined')),

  -- Timestamps
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  connected_at TIMESTAMP,
  ended_at TIMESTAMP,

  -- Metrics
  duration_seconds INTEGER DEFAULT 0,
  connection_time_seconds INTEGER, -- Time taken to connect

  -- Quality metrics
  is_qualified_lead BOOLEAN DEFAULT 0,
  lead_quality_score INTEGER CHECK (lead_quality_score BETWEEN 1 AND 5),

  -- URLs for reference
  host_url TEXT,
  guest_url TEXT,

  -- Notes
  notes TEXT,

  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id)
);

-- Performance Metrics Table
-- Aggregated daily/hourly metrics for dashboard
CREATE TABLE IF NOT EXISTS performance_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key TEXT NOT NULL,

  -- Time period
  date DATE NOT NULL,
  hour INTEGER CHECK (hour BETWEEN 0 AND 23),

  -- Call metrics
  total_calls INTEGER DEFAULT 0,
  connected_calls INTEGER DEFAULT 0,
  failed_calls INTEGER DEFAULT 0,
  declined_calls INTEGER DEFAULT 0,

  -- Success metrics
  connection_rate REAL, -- Percentage of calls that connected
  avg_connection_time_seconds REAL,
  avg_call_duration_seconds REAL,

  -- Lead metrics
  qualified_leads INTEGER DEFAULT 0,
  total_visitors INTEGER DEFAULT 0,

  -- Engagement
  total_page_views INTEGER DEFAULT 0,
  avg_session_duration_seconds REAL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(api_key, date, hour)
);

-- Visitor Events Table
-- Tracks all visitor interactions for detailed analytics
CREATE TABLE IF NOT EXISTS visitor_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key TEXT NOT NULL,
  visitor_id TEXT NOT NULL,

  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'page_view',
    'video_invite_sent',
    'video_accepted',
    'video_declined',
    'video_connected',
    'video_ended',
    'visitor_left'
  )),

  -- Event data (JSON string)
  event_data TEXT,

  -- Metadata
  page_url TEXT,
  user_agent TEXT,
  ip_address TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id)
);

-- Slack Notifications Table
-- Track all Slack notifications sent
CREATE TABLE IF NOT EXISTS slack_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key TEXT NOT NULL,

  -- Notification details
  notification_type TEXT NOT NULL CHECK (notification_type IN ('new_visitor', 'video_call_request')),
  visitor_id TEXT,
  video_session_id TEXT,

  -- Status
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),

  -- Payload
  payload TEXT, -- JSON string of what was sent

  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company Insights Table
-- Aggregated data by company for "Top Companies" widget
CREATE TABLE IF NOT EXISTS company_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key TEXT NOT NULL,
  company TEXT NOT NULL,

  -- Visit metrics
  total_visits INTEGER DEFAULT 0,
  total_visitors INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,

  -- Engagement
  total_video_calls INTEGER DEFAULT 0,
  successful_connections INTEGER DEFAULT 0,
  avg_session_duration_seconds REAL,

  -- Lead quality
  qualified_leads INTEGER DEFAULT 0,

  -- Metadata
  first_visit_at TIMESTAMP,
  last_visit_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(api_key, company)
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_video_calls_api_key ON video_calls(api_key);
CREATE INDEX IF NOT EXISTS idx_video_calls_visitor ON video_calls(visitor_id);
CREATE INDEX IF NOT EXISTS idx_video_calls_status ON video_calls(status);
CREATE INDEX IF NOT EXISTS idx_video_calls_created ON video_calls(invited_at DESC);

CREATE INDEX IF NOT EXISTS idx_performance_api_key ON performance_metrics(api_key);
CREATE INDEX IF NOT EXISTS idx_performance_date ON performance_metrics(date DESC);

CREATE INDEX IF NOT EXISTS idx_visitor_events_visitor ON visitor_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_type ON visitor_events(event_type);
CREATE INDEX IF NOT EXISTS idx_visitor_events_created ON visitor_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_slack_notifications_api_key ON slack_notifications(api_key);
CREATE INDEX IF NOT EXISTS idx_slack_notifications_created ON slack_notifications(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_company_insights_api_key ON company_insights(api_key);
CREATE INDEX IF NOT EXISTS idx_company_insights_company ON company_insights(company);
CREATE INDEX IF NOT EXISTS idx_company_insights_updated ON company_insights(updated_at DESC);

-- Trigger to update performance_metrics timestamp
CREATE TRIGGER IF NOT EXISTS update_performance_metrics_timestamp
AFTER UPDATE ON performance_metrics
BEGIN
  UPDATE performance_metrics SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to update company_insights timestamp
CREATE TRIGGER IF NOT EXISTS update_company_insights_timestamp
AFTER UPDATE ON company_insights
BEGIN
  UPDATE company_insights SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
