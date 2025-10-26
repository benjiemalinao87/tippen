-- Migration: Add Slack notification tracking to visitors table
-- This allows rate limiting Slack notifications (max 2 per minute)

ALTER TABLE visitors ADD COLUMN last_slack_notification_at TIMESTAMP;

-- Create index for fast lookups when checking notification eligibility
CREATE INDEX IF NOT EXISTS idx_last_slack_notification ON visitors(last_slack_notification_at);
