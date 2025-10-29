/**
 * Authentication utilities
 * Helper functions to access authenticated user data
 */

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: number;
  organizationName: string;
  apiKey: string; // Organization's unique API key for multi-tenant isolation
}

/**
 * Get the authenticated user from localStorage
 */
export function getAuthenticatedUser(): User | null {
  try {
    const userStr = localStorage.getItem('tippen_user');
    if (!userStr) {
      return null;
    }
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('[Auth] Failed to parse user from localStorage:', error);
    return null;
  }
}

/**
 * Get the authenticated user's API key
 * This is the organization's unique API key used for multi-tenant data isolation
 */
export function getUserApiKey(): string | null {
  const user = getAuthenticatedUser();
  return user?.apiKey || null;
}

/**
 * Get the authentication token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('tippen_auth_token');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken() && !!getAuthenticatedUser();
}
