-- Fix organizations schema to match onboarding form
-- Add use_case column and change staff_count to TEXT for ranges

-- Add use_case column
ALTER TABLE organizations ADD COLUMN use_case TEXT;

-- Note: SQLite doesn't support ALTER COLUMN TYPE
-- We need to handle staff_count as TEXT in the application
-- For now, we'll store staff count ranges as strings in the INTEGER field
-- This is acceptable as SQLite is dynamically typed
