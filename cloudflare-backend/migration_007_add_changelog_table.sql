-- Migration: Add changelog table for tracking updates
-- Date: 2026-01-13

CREATE TABLE IF NOT EXISTS changelog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT,
  title TEXT NOT NULL,
  description TEXT,
  commit_hash TEXT,
  commit_message TEXT,
  author TEXT,
  category TEXT DEFAULT 'update', -- feature, fix, improvement, breaking, security
  is_published INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  published_at TEXT DEFAULT (datetime('now'))
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_changelog_created_at ON changelog(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_changelog_category ON changelog(category);
CREATE INDEX IF NOT EXISTS idx_changelog_commit_hash ON changelog(commit_hash);
