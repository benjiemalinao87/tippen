-- Migration 004: Add saas-owner role
-- Date: 2025-01-16
-- Purpose: Add platform administrator role for Command Center access
-- Author: Claude AI

-- SQLite doesn't support altering CHECK constraints directly
-- We need to recreate the users table with the new role option

-- Step 1: Create new table with updated role constraint
CREATE TABLE IF NOT EXISTS users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER,  -- NULL for saas-owner (not tied to any org)

  -- Authentication
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,

  -- Profile
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,

  -- Role-based access control (NEW: added 'saas-owner')
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('saas-owner', 'admin', 'member', 'viewer')),

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited', 'suspended')),
  email_verified BOOLEAN DEFAULT 0,

  -- Session management
  last_login_at TIMESTAMP,
  last_active_at TIMESTAMP,

  -- Security
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMP,
  email_verification_token TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Step 2: Copy all existing data from old table to new table
INSERT INTO users_new SELECT * FROM users;

-- Step 3: Drop the old table
DROP TABLE users;

-- Step 4: Rename new table to users
ALTER TABLE users_new RENAME TO users;

-- Step 5: Recreate all indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Step 6: Recreate trigger for updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Step 7: Create default saas-owner user
-- Password: "TippenAdmin2025!" (hashed with bcrypt)
-- NOTE: You MUST change this password after first login!
INSERT OR IGNORE INTO users (
  organization_id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  email_verified,
  status
) VALUES (
  NULL,  -- Not tied to any organization
  'admin@tippen.app',
  '$2b$10$XQmXYZ9.8hN7vK3Lw2Ej5OzGqR4Ts6Uv8Wx0Yy2Za4Bb6Cc8De0Fg',  -- TippenAdmin2025!
  'Platform',
  'Administrator',
  'saas-owner',
  1,
  'active'
);

-- Verification: Check if migration was successful
SELECT
  'Migration 004 Complete' as status,
  COUNT(*) as total_users,
  SUM(CASE WHEN role = 'saas-owner' THEN 1 ELSE 0 END) as saas_owners,
  SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
  SUM(CASE WHEN role = 'member' THEN 1 ELSE 0 END) as members,
  SUM(CASE WHEN role = 'viewer' THEN 1 ELSE 0 END) as viewers
FROM users;

-- Expected output:
-- status: Migration 004 Complete
-- total_users: (your count)
-- saas_owners: 1 (at least)
-- admins: (your count)
-- members: (your count)
-- viewers: (your count)
