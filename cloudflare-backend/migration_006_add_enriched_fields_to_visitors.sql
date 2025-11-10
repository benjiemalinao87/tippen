-- Migration 006: Add enriched fields to visitors table
-- Date: 2025-01-16
-- Purpose: Store Enrich.so enrichment data persistently in visitors table
-- This enables historical tracking and prevents data loss on Durable Object restart
-- Author: Claude AI

-- Add new columns to visitors table for enriched data
ALTER TABLE visitors ADD COLUMN company_domain TEXT;
ALTER TABLE visitors ADD COLUMN industry TEXT;
ALTER TABLE visitors ADD COLUMN revenue TEXT;
ALTER TABLE visitors ADD COLUMN employees INTEGER;
ALTER TABLE visitors ADD COLUMN enriched_location TEXT; -- Separate from timezone field
ALTER TABLE visitors ADD COLUMN enrichment_source TEXT CHECK (enrichment_source IN ('enrich_so', 'cache', 'fallback'));
ALTER TABLE visitors ADD COLUMN is_cached BOOLEAN DEFAULT 0; -- 1 if data came from cache, 0 if fresh API call
ALTER TABLE visitors ADD COLUMN enriched_at TIMESTAMP; -- When enrichment occurred

-- Create indexes for new fields (for efficient filtering and analytics)
CREATE INDEX IF NOT EXISTS idx_visitors_company_domain ON visitors(company_domain);
CREATE INDEX IF NOT EXISTS idx_visitors_industry ON visitors(industry);
CREATE INDEX IF NOT EXISTS idx_visitors_enrichment_source ON visitors(enrichment_source);
CREATE INDEX IF NOT EXISTS idx_visitors_is_cached ON visitors(is_cached);
CREATE INDEX IF NOT EXISTS idx_visitors_enriched_at ON visitors(enriched_at DESC);

-- Create index for revenue analysis (text field, but useful for grouping)
CREATE INDEX IF NOT EXISTS idx_visitors_revenue ON visitors(revenue);

-- Sample query: Get enrichment statistics
/*
SELECT
  COUNT(*) as total_visitors,
  SUM(CASE WHEN enrichment_source = 'enrich_so' THEN 1 ELSE 0 END) as enriched_fresh,
  SUM(CASE WHEN enrichment_source = 'cache' THEN 1 ELSE 0 END) as enriched_cached,
  SUM(CASE WHEN enrichment_source = 'fallback' THEN 1 ELSE 0 END) as fallback,
  ROUND((SUM(CASE WHEN enrichment_source IN ('enrich_so', 'cache') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as enrichment_rate_percent
FROM visitors
WHERE created_at > datetime('now', '-7 days');
*/

-- Sample query: Top companies by visitor count
/*
SELECT
  company,
  company_domain,
  industry,
  revenue,
  COUNT(*) as visitor_count,
  SUM(page_views) as total_page_views
FROM visitors
WHERE enrichment_source IN ('enrich_so', 'cache')
  AND company IS NOT NULL
  AND company != 'Direct Visitor'
GROUP BY company, company_domain
ORDER BY visitor_count DESC
LIMIT 20;
*/

-- Sample query: Revenue bracket analysis
/*
SELECT
  revenue,
  COUNT(*) as visitor_count,
  ROUND(AVG(page_views), 2) as avg_page_views,
  ROUND(AVG(time_on_site), 2) as avg_time_on_site
FROM visitors
WHERE revenue IS NOT NULL
GROUP BY revenue
ORDER BY visitor_count DESC;
*/

-- Sample query: Industry breakdown
/*
SELECT
  industry,
  COUNT(*) as visitor_count,
  COUNT(DISTINCT company) as unique_companies,
  ROUND(AVG(page_views), 2) as avg_page_views
FROM visitors
WHERE industry IS NOT NULL
GROUP BY industry
ORDER BY visitor_count DESC;
*/

-- Verification: Check if migration was successful
SELECT
  'Migration 006 Complete' as status,
  COUNT(*) as total_columns
FROM pragma_table_info('visitors')
WHERE name IN ('company_domain', 'industry', 'revenue', 'employees', 'enriched_location', 'enrichment_source', 'is_cached', 'enriched_at');

-- Expected output:
-- status: Migration 006 Complete
-- total_columns: 8 (all new columns added)
