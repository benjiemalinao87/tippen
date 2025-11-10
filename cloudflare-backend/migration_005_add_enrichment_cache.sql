-- Migration 005: IP-based enrichment cache
-- Date: 2025-01-16
-- Purpose: Cache Enrich.so API responses to prevent duplicate lookups and save credits
-- Cost Savings: Expected 70%+ reduction in API calls
-- Author: Claude AI

-- Create enrichment_cache table
CREATE TABLE IF NOT EXISTS enrichment_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- IP address (unique key for caching)
  ip_address TEXT UNIQUE NOT NULL,

  -- Enriched company data
  company_name TEXT,
  company_domain TEXT,
  industry TEXT,
  revenue TEXT,
  employees INTEGER,
  location TEXT,

  -- Full API response (for debugging and future use)
  raw_response TEXT, -- JSON string of complete Enrich.so response

  -- Metadata
  status TEXT CHECK (status IN ('success', 'failed', 'no_data', 'rate_limited')) DEFAULT 'success',
  error_message TEXT,

  -- Usage tracking (for analytics)
  lookup_count INTEGER DEFAULT 1, -- How many times this IP was looked up
  credits_used INTEGER DEFAULT 1, -- Always 1 (only charged on first lookup)
  credits_saved INTEGER DEFAULT 0, -- Increments with each cache hit

  -- Timestamps
  first_looked_up_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Cache expiration (refresh after 30 days for successful lookups)
  expires_at TIMESTAMP,

  -- API metadata (for monitoring)
  api_response_time_ms INTEGER, -- How long the API took to respond
  enrich_api_version TEXT DEFAULT 'v1'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrichment_ip ON enrichment_cache(ip_address);
CREATE INDEX IF NOT EXISTS idx_enrichment_company ON enrichment_cache(company_name);
CREATE INDEX IF NOT EXISTS idx_enrichment_status ON enrichment_cache(status);
CREATE INDEX IF NOT EXISTS idx_enrichment_expires ON enrichment_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_enrichment_first_lookup ON enrichment_cache(first_looked_up_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrichment_last_accessed ON enrichment_cache(last_accessed_at DESC);

-- Trigger to update last_accessed_at and credits_saved on cache hit
CREATE TRIGGER IF NOT EXISTS update_enrichment_cache_usage
AFTER UPDATE ON enrichment_cache
WHEN NEW.lookup_count > OLD.lookup_count
BEGIN
  UPDATE enrichment_cache
  SET
    last_accessed_at = CURRENT_TIMESTAMP,
    credits_saved = credits_saved + 1
  WHERE id = NEW.id;
END;

-- Sample query: Get cache statistics
-- Uncomment to run after data is populated
/*
SELECT
  COUNT(*) as total_ips_cached,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_lookups,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_lookups,
  SUM(lookup_count) as total_lookups,
  SUM(credits_used) as total_credits_used,
  SUM(credits_saved) as total_credits_saved,
  ROUND(AVG(api_response_time_ms), 2) as avg_response_time_ms,
  ROUND((SUM(credits_saved) * 100.0 / SUM(lookup_count)), 2) as cache_hit_rate_percent
FROM enrichment_cache;
*/

-- Sample query: Find most frequently looked up IPs
/*
SELECT
  ip_address,
  company_name,
  lookup_count,
  credits_saved,
  first_looked_up_at,
  last_accessed_at
FROM enrichment_cache
WHERE status = 'success'
ORDER BY lookup_count DESC
LIMIT 20;
*/

-- Sample query: Find expired cache entries that need refresh
/*
SELECT COUNT(*) as expired_entries
FROM enrichment_cache
WHERE expires_at < datetime('now');
*/

-- Verification: Check if migration was successful
SELECT
  'Migration 005 Complete' as status,
  'enrichment_cache table created' as table_name,
  COUNT(*) as initial_row_count
FROM enrichment_cache;

-- Expected output:
-- status: Migration 005 Complete
-- table_name: enrichment_cache table created
-- initial_row_count: 0
