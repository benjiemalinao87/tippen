/**
 * Authentication Service for Tippen
 * Handles user signup, login, password hashing, and JWT generation
 */

export interface SignupRequest {
  // Account info
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  // Company info
  companyName: string;
  staffCount: string;
  revenue: string;

  // Additional info
  industry?: string;
  website?: string;
  referralSource?: string;
  useCase?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organizationId: number;
    organizationName: string;
  };
  error?: string;
}

/**
 * Hash password using Web Crypto API (available in Cloudflare Workers)
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verify password against hash
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Generate simple JWT token (for demo purposes)
 * In production, use a proper JWT library like jose
 */
function generateToken(userId: number, email: string, organizationId: number): string {
  const payload = {
    userId,
    email,
    organizationId,
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  };

  // Simple base64 encoding (NOT SECURE - use proper JWT in production)
  return btoa(JSON.stringify(payload));
}

/**
 * Handle user signup
 */
export async function handleSignup(
  db: D1Database,
  request: SignupRequest
): Promise<AuthResponse> {
  try {
    // Validate required fields
    if (!request.email || !request.password || !request.companyName) {
      return {
        success: false,
        error: 'Email, password, and company name are required'
      };
    }

    // Check if user already exists
    const existingUser = await db.prepare(
      'SELECT id FROM users WHERE email = ?'
    )
      .bind(request.email.toLowerCase())
      .first();

    if (existingUser) {
      return {
        success: false,
        error: 'An account with this email already exists'
      };
    }

    // Hash password
    const passwordHash = await hashPassword(request.password);

    // Create organization first
    const orgResult = await db.prepare(
      `INSERT INTO organizations
       (name, staff_count, revenue, industry, website, referral_source, use_case)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        request.companyName,
        request.staffCount || null,
        request.revenue || null,
        request.industry || null,
        request.website || null,
        request.referralSource || null,
        request.useCase || null
      )
      .run();

    const organizationId = orgResult.meta.last_row_id;

    // Create user as admin of organization
    const userResult = await db.prepare(
      `INSERT INTO users
       (organization_id, email, password_hash, first_name, last_name, role, status)
       VALUES (?, ?, ?, ?, ?, 'admin', 'active')`
    )
      .bind(
        organizationId,
        request.email.toLowerCase(),
        passwordHash,
        request.firstName,
        request.lastName
      )
      .run();

    const userId = userResult.meta.last_row_id;

    // Generate token
    const token = generateToken(userId, request.email, organizationId);

    // Create session
    await db.prepare(
      `INSERT INTO sessions (user_id, token, expires_at)
       VALUES (?, ?, datetime('now', '+30 days'))`
    )
      .bind(userId, token)
      .run();

    // Log audit event
    await db.prepare(
      `INSERT INTO audit_logs (user_id, action, ip_address, details)
       VALUES (?, 'user_signup', ?, ?)`
    )
      .bind(
        userId,
        null, // IP will be added from request
        JSON.stringify({ email: request.email, organizationId })
      )
      .run();

    console.log(`[Auth] New user signup: ${request.email} (org: ${request.companyName})`);

    return {
      success: true,
      token,
      user: {
        id: userId,
        email: request.email,
        firstName: request.firstName,
        lastName: request.lastName,
        role: 'admin',
        organizationId,
        organizationName: request.companyName
      }
    };
  } catch (error) {
    console.error('[Auth] Signup error:', error);
    return {
      success: false,
      error: 'Failed to create account. Please try again.'
    };
  }
}

/**
 * Handle user login
 */
export async function handleLogin(
  db: D1Database,
  request: LoginRequest
): Promise<AuthResponse> {
  try {
    // Validate input
    if (!request.email || !request.password) {
      return {
        success: false,
        error: 'Email and password are required'
      };
    }

    // Find user
    const user = await db.prepare(
      `SELECT u.*, o.name as organization_name
       FROM users u
       JOIN organizations o ON u.organization_id = o.id
       WHERE u.email = ? AND u.status = 'active'`
    )
      .bind(request.email.toLowerCase())
      .first() as any;

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }

    // Verify password
    const validPassword = await verifyPassword(request.password, user.password_hash);
    if (!validPassword) {
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.organization_id);

    // Create session
    const expiryDays = request.rememberMe ? 30 : 1;
    await db.prepare(
      `INSERT INTO sessions (user_id, token, expires_at)
       VALUES (?, ?, datetime('now', '+${expiryDays} days'))`
    )
      .bind(user.id, token)
      .run();

    // Update last login
    await db.prepare(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?'
    )
      .bind(user.id)
      .run();

    // Log audit event
    await db.prepare(
      `INSERT INTO audit_logs (user_id, action, ip_address, details)
       VALUES (?, 'user_login', ?, ?)`
    )
      .bind(
        user.id,
        null,
        JSON.stringify({ rememberMe: request.rememberMe })
      )
      .run();

    console.log(`[Auth] User login: ${user.email}`);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        organizationId: user.organization_id,
        organizationName: user.organization_name
      }
    };
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return {
      success: false,
      error: 'Failed to log in. Please try again.'
    };
  }
}

/**
 * Verify session token
 */
export async function verifySession(
  db: D1Database,
  token: string
): Promise<AuthResponse> {
  try {
    const session = await db.prepare(
      `SELECT s.*, u.email, u.first_name, u.last_name, u.role, u.organization_id,
              o.name as organization_name
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       JOIN organizations o ON u.organization_id = o.id
       WHERE s.token = ?
         AND s.revoked_at IS NULL
         AND s.expires_at > datetime('now')
         AND u.status = 'active'`
    )
      .bind(token)
      .first() as any;

    if (!session) {
      return {
        success: false,
        error: 'Invalid or expired session'
      };
    }

    return {
      success: true,
      user: {
        id: session.user_id,
        email: session.email,
        firstName: session.first_name,
        lastName: session.last_name,
        role: session.role,
        organizationId: session.organization_id,
        organizationName: session.organization_name
      }
    };
  } catch (error) {
    console.error('[Auth] Session verification error:', error);
    return {
      success: false,
      error: 'Session verification failed'
    };
  }
}

/**
 * Logout (revoke session)
 */
export async function handleLogout(
  db: D1Database,
  token: string
): Promise<{ success: boolean }> {
  try {
    await db.prepare(
      'UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token = ?'
    )
      .bind(token)
      .run();

    return { success: true };
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    return { success: false };
  }
}
