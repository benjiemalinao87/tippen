/**
 * Authentication utilities
 * Helper functions to access authenticated user data
 */

const IMPERSONATION_STORAGE_KEY = 'tippen_impersonation';

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

interface ImpersonationData {
  targetOrganization: {
    id: number;
    name: string;
    apiKey: string;
  };
  startedAt: string;
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
 * Check if currently impersonating another organization
 */
export function getImpersonationData(): ImpersonationData | null {
  try {
    const impersonationStr = localStorage.getItem(IMPERSONATION_STORAGE_KEY);
    if (!impersonationStr) {
      return null;
    }
    return JSON.parse(impersonationStr) as ImpersonationData;
  } catch (error) {
    console.error('[Auth] Failed to parse impersonation data:', error);
    return null;
  }
}

/**
 * Check if currently in impersonation mode
 */
export function isImpersonating(): boolean {
  return !!getImpersonationData()?.targetOrganization;
}

/**
 * Get the active API key - checks impersonation first, then falls back to user's own key
 * This is the organization's unique API key used for multi-tenant data isolation
 */
export function getUserApiKey(): string | null {
  // First check if we're impersonating another organization
  const impersonation = getImpersonationData();
  if (impersonation?.targetOrganization?.apiKey) {
    console.log('[Auth] Using impersonated API key for:', impersonation.targetOrganization.name);
    return impersonation.targetOrganization.apiKey;
  }

  // Fall back to user's own API key
  const user = getAuthenticatedUser();
  return user?.apiKey || null;
}

/**
 * Get the active organization name - for display purposes
 */
export function getActiveOrganizationName(): string {
  const impersonation = getImpersonationData();
  if (impersonation?.targetOrganization?.name) {
    return impersonation.targetOrganization.name;
  }
  
  const user = getAuthenticatedUser();
  return user?.organizationName || 'Unknown';
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
