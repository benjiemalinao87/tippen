import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Organization {
  id: number;
  name: string;
  apiKey: string;
  slug?: string;
}

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: number;
  organizationName: string;
  apiKey: string;
}

interface ImpersonationState {
  isImpersonating: boolean;
  targetOrganization: Organization | null;
  originalUser: UserData | null;
  organizations: Organization[];
  isLoading: boolean;
  startImpersonation: (org: Organization) => Promise<void>;
  exitImpersonation: () => void;
  getActiveApiKey: () => string | null;
  getActiveOrganizationName: () => string;
  loadOrganizations: () => Promise<void>;
}

const ImpersonationContext = createContext<ImpersonationState | undefined>(undefined);

const IMPERSONATION_STORAGE_KEY = 'tippen_impersonation';

interface ImpersonationProviderProps {
  children: ReactNode;
}

export function ImpersonationProvider({ children }: ImpersonationProviderProps) {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [targetOrganization, setTargetOrganization] = useState<Organization | null>(null);
  const [originalUser, setOriginalUser] = useState<UserData | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load original user and check for existing impersonation on mount
  useEffect(() => {
    const userStr = localStorage.getItem('tippen_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setOriginalUser(user);

        // Check if there's an existing impersonation session
        const impersonationStr = localStorage.getItem(IMPERSONATION_STORAGE_KEY);
        if (impersonationStr) {
          try {
            const impersonation = JSON.parse(impersonationStr);
            if (impersonation.targetOrganization) {
              setTargetOrganization(impersonation.targetOrganization);
              setIsImpersonating(true);
            }
          } catch (e) {
            localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
          }
        }

        // Load organizations if user is saas-owner
        if (user.role === 'saas-owner') {
          loadOrganizations();
        }
      } catch (error) {
        console.error('[Impersonation] Error loading user:', error);
      }
    }
  }, []);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const BACKEND_URL = import.meta.env.VITE_VISITOR_WS_URL
        ?.replace('wss://', 'https://')
        ?.replace('ws://', 'http://')
        ?.replace('/ws/dashboard', '') || 'https://tippen-backend.benjiemalinao879557.workers.dev';

      const token = localStorage.getItem('tippen_auth_token');
      if (!token) {
        console.error('[Impersonation] No auth token found');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/admin/organizations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load organizations');
      }

      const data = await response.json();
      if (data.success && data.organizations) {
        setOrganizations(data.organizations);
        console.log(`[Impersonation] Loaded ${data.organizations.length} organizations`);
      }
    } catch (error) {
      console.error('[Impersonation] Error loading organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startImpersonation = async (org: Organization) => {
    try {
      setIsLoading(true);
      const BACKEND_URL = import.meta.env.VITE_VISITOR_WS_URL
        ?.replace('wss://', 'https://')
        ?.replace('ws://', 'http://')
        ?.replace('/ws/dashboard', '') || 'https://tippen-backend.benjiemalinao879557.workers.dev';

      const token = localStorage.getItem('tippen_auth_token');
      if (!token) {
        console.error('[Impersonation] No auth token found');
        return;
      }

      // Call backend to log the impersonation
      const response = await fetch(`${BACKEND_URL}/api/admin/switch-workspace`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ organizationId: org.id })
      });

      if (!response.ok) {
        throw new Error('Failed to switch workspace');
      }

      const data = await response.json();
      if (data.success && data.organization) {
        setTargetOrganization(data.organization);
        setIsImpersonating(true);

        // Store in localStorage for persistence
        localStorage.setItem(IMPERSONATION_STORAGE_KEY, JSON.stringify({
          targetOrganization: data.organization,
          startedAt: new Date().toISOString()
        }));

        // Dispatch custom event so other components can react
        window.dispatchEvent(new CustomEvent('tippen-impersonation-change', {
          detail: { action: 'start', organization: data.organization }
        }));

        console.log(`[Impersonation] Started viewing: ${data.organization.name}`);
      }
    } catch (error) {
      console.error('[Impersonation] Error starting impersonation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exitImpersonation = () => {
    setIsImpersonating(false);
    setTargetOrganization(null);
    localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
    
    // Dispatch custom event so other components can react
    window.dispatchEvent(new CustomEvent('tippen-impersonation-change', {
      detail: { action: 'exit' }
    }));
    
    console.log('[Impersonation] Exited impersonation mode');
  };

  const getActiveApiKey = (): string | null => {
    if (isImpersonating && targetOrganization) {
      return targetOrganization.apiKey;
    }
    return originalUser?.apiKey || null;
  };

  const getActiveOrganizationName = (): string => {
    if (isImpersonating && targetOrganization) {
      return targetOrganization.name;
    }
    return originalUser?.organizationName || 'Tippen HQ';
  };

  return (
    <ImpersonationContext.Provider
      value={{
        isImpersonating,
        targetOrganization,
        originalUser,
        organizations,
        isLoading,
        startImpersonation,
        exitImpersonation,
        getActiveApiKey,
        getActiveOrganizationName,
        loadOrganizations
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  const context = useContext(ImpersonationContext);
  if (context === undefined) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider');
  }
  return context;
}
