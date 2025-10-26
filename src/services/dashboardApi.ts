/**
 * Dashboard Analytics API Service
 * Fetches real-time metrics from Cloudflare D1 database
 */

const BACKEND_URL = import.meta.env.VITE_VISITOR_WS_URL?.replace('ws://', 'http://').replace('wss://', 'https://').replace('/ws/dashboard', '') ||
                    'https://tippen-backend.benjiemalinao879557.workers.dev';

/**
 * Get API key from authenticated user
 */
function getUserApiKey(): string {
  try {
    const userStr = localStorage.getItem('tippen_user');
    if (!userStr) {
      throw new Error('No user found in localStorage');
    }

    const user = JSON.parse(userStr);
    if (!user.apiKey) {
      throw new Error('No API key found for user');
    }

    return user.apiKey;
  } catch (error) {
    console.error('[Dashboard API] Failed to get user API key:', error);
    // Fallback to env variable for backwards compatibility
    return import.meta.env.VITE_TIPPEN_API_KEY || 'demo_tippen_2025_live_k8m9n2p4q7r1';
  }
}

export interface DashboardMetrics {
  totalOutboundCalls: number;
  connectionRate: number;
  qualifiedLeads: number;
  avgCallDuration: number;
  totalVisitors: number;
  activeVisitors: number;
}

export interface TopCompany {
  company: string;
  total_visits: number;
  total_video_calls: number;
  successful_connections: number;
  qualified_leads: number;
  avg_session_duration_seconds: number;
}

export interface CallVolumeData {
  date: string;
  total_calls: number;
  successful_calls: number;
}

/**
 * Get dashboard metrics
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const apiKey = getUserApiKey();
    const response = await fetch(
      `${BACKEND_URL}/api/analytics/dashboard?api_key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard metrics: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    // Return fallback data
    return {
      totalOutboundCalls: 0,
      connectionRate: 0,
      qualifiedLeads: 0,
      avgCallDuration: 0,
      totalVisitors: 0,
      activeVisitors: 0
    };
  }
}

/**
 * Get top companies
 */
export async function getTopCompanies(limit: number = 10): Promise<TopCompany[]> {
  try {
    const apiKey = getUserApiKey();
    const response = await fetch(
      `${BACKEND_URL}/api/analytics/top-companies?api_key=${apiKey}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch top companies: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching top companies:', error);
    return [];
  }
}

/**
 * Get call volume over time
 */
export async function getCallVolume(days: number = 7): Promise<CallVolumeData[]> {
  try {
    const apiKey = getUserApiKey();
    const response = await fetch(
      `${BACKEND_URL}/api/analytics/call-volume?api_key=${apiKey}&days=${days}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch call volume: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching call volume:', error);
    return [];
  }
}
