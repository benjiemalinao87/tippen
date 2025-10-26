-- Add revoked_at column to sessions table for logout functionality
ALTER TABLE sessions ADD COLUMN revoked_at TIMESTAMP;
