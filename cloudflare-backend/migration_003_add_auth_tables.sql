-- Migration: Add authentication and user management tables
-- Supports multi-tenant SaaS with role-based access control

-- Organizations/Companies Table
CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly name (e.g., "acme-corp")

  -- Company details from onboarding
  staff_count INTEGER,
  revenue_range TEXT, -- e.g., "$0-$100k", "$100k-$1M", "$1M-$10M", etc.
  industry TEXT,
  website TEXT,
  referral_source TEXT, -- "How did you hear about us"

  -- Subscription/billing
  plan_type TEXT DEFAULT 'trial' CHECK (plan_type IN ('trial', 'starter', 'professional', 'enterprise')),
  trial_ends_at TIMESTAMP,

  -- API key association
  api_key TEXT UNIQUE,

  -- Settings
  settings TEXT, -- JSON string for org-level settings

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (api_key) REFERENCES api_keys(api_key)
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL,

  -- Authentication
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Hashed with bcrypt

  -- Profile
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,

  -- Role-based access control
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),

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

-- Sessions Table (for JWT/session management)
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,

  -- Session data
  token TEXT UNIQUE NOT NULL, -- JWT or session token
  refresh_token TEXT UNIQUE,

  -- Device/client info
  user_agent TEXT,
  ip_address TEXT,
  device_type TEXT, -- "desktop", "mobile", "tablet"

  -- Expiration
  expires_at TIMESTAMP NOT NULL,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Invitations Table (for inviting team members)
CREATE TABLE IF NOT EXISTS invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL,

  -- Invitation details
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by INTEGER NOT NULL, -- user_id of inviter

  -- Token
  token TEXT UNIQUE NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  accepted_at TIMESTAMP,
  expires_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES users(id)
);

-- Audit Log Table (track important actions)
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER,
  user_id INTEGER,

  -- Action details
  action TEXT NOT NULL, -- "user.login", "user.logout", "org.updated", "user.created", etc.
  resource_type TEXT, -- "user", "organization", "visitor", "video_call", etc.
  resource_id TEXT,

  -- Changes (JSON)
  old_values TEXT, -- JSON string of previous values
  new_values TEXT, -- JSON string of new values

  -- Request metadata
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_api_key ON organizations(api_key);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_invitations_org ON invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_organizations_timestamp
AFTER UPDATE ON organizations
BEGIN
  UPDATE organizations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_sessions_activity
AFTER UPDATE ON sessions
BEGIN
  UPDATE sessions SET last_activity_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
