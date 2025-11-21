import { useState, useEffect } from 'react';
import { Building2, Users, DollarSign, Database, TrendingUp, Activity } from 'lucide-react';
import { OrganizationOverviewTable } from './OrganizationOverviewTable';
import { OrganizationDetailModal } from './OrganizationDetailModal';
import { CreditUsageChart } from './CreditUsageChart';
import { EnrichmentStatsWidget } from './EnrichmentStatsWidget';

interface CommandCenterStats {
  totalOrganizations: number;
  totalUsers: number;
  totalVisitors: number;
  totalCreditsUsed: number;
  totalCreditsSaved: number;
  cacheHitRate: number;
  organizations: OrganizationData[];
  creditUsageHistory: CreditUsageData[];
  enrichmentStats: EnrichmentStats;
}

interface OrganizationData {
  id: number;
  name: string;
  apiKey: string;
  totalUsers: number;
  totalVisitors: number;
  totalVideoCalls: number;
  totalInvites: number;
  connectedCalls: number;
  qualifiedLeads: number;
  avgCallDuration: number;
  creditsUsed: number;
  cacheHits: number;
  lastActivity: string;
  status: 'active' | 'inactive';
}

interface CreditUsageData {
  date: string;
  creditsUsed: number;
  creditsSaved: number;
}

interface EnrichmentStats {
  totalLookups: number;
  successfulLookups: number;
  failedLookups: number;
  cacheHits: number;
  cacheMisses: number;
  avgResponseTime: number;
}

export function CommandCenter() {
  const [stats, setStats] = useState<CommandCenterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationData | null>(null);

  useEffect(() => {
    loadCommandCenterData();
  }, []);

  const loadCommandCenterData = async () => {
    try {
      setLoading(true);
      setError(null);

      const BACKEND_URL = import.meta.env.VITE_VISITOR_WS_URL
        ?.replace('wss://', 'https://')
        .replace('ws://', 'http://')
        .replace('/ws/dashboard', '') || 'https://tippen-backend.benjiemalinao879557.workers.dev';

      const response = await fetch(`${BACKEND_URL}/api/admin/command-center`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tippen_auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load command center data');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error loading command center data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');

      // Fallback to mock data for development
      setStats(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = (): CommandCenterStats => ({
    totalOrganizations: 3,
    totalUsers: 8,
    totalVisitors: 1247,
    totalCreditsUsed: 156,
    totalCreditsSaved: 523,
    cacheHitRate: 77.0,
    organizations: [
      {
        id: 1,
        name: 'Portant',
        apiKey: 'demo_api_key',
        totalUsers: 3,
        totalVisitors: 856,
        totalVideoCalls: 45,
        totalInvites: 52,
        connectedCalls: 38,
        qualifiedLeads: 22,
        avgCallDuration: 342,
        creditsUsed: 89,
        cacheHits: 312,
        lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'active'
      },
      {
        id: 2,
        name: 'Acme Corp',
        apiKey: 'acme_api_key_123',
        totalUsers: 5,
        totalVisitors: 391,
        totalVideoCalls: 28,
        totalInvites: 35,
        connectedCalls: 21,
        qualifiedLeads: 15,
        avgCallDuration: 287,
        creditsUsed: 67,
        cacheHits: 211,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      }
    ],
    creditUsageHistory: [
      { date: '2025-11-03', creditsUsed: 15, creditsSaved: 42 },
      { date: '2025-11-04', creditsUsed: 18, creditsSaved: 56 },
      { date: '2025-11-05', creditsUsed: 22, creditsSaved: 68 },
      { date: '2025-11-06', creditsUsed: 19, creditsSaved: 71 },
      { date: '2025-11-07', creditsUsed: 25, creditsSaved: 89 },
      { date: '2025-11-08', creditsUsed: 28, creditsSaved: 95 },
      { date: '2025-11-09', creditsUsed: 29, creditsSaved: 102 }
    ],
    enrichmentStats: {
      totalLookups: 679,
      successfulLookups: 156,
      failedLookups: 0,
      cacheHits: 523,
      cacheMisses: 156,
      avgResponseTime: 245
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Failed to load command center data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Command Center</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Platform-wide monitoring and analytics
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Organizations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Organizations</p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                {stats.totalOrganizations}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                {stats.totalUsers}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Total Visitors Tracked */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Visitors Tracked</p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                {stats.totalVisitors.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Credits Used */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Credits Used</p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                {stats.totalCreditsUsed.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                ${(stats.totalCreditsUsed * 0.05).toFixed(2)} spent
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        {/* Credits Saved */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Credits Saved (Cache)</p>
              <p className="text-3xl font-semibold text-green-600 dark:text-green-400 mt-2">
                {stats.totalCreditsSaved.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                ${(stats.totalCreditsSaved * 0.05).toFixed(2)} saved
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Cache Hit Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cache Hit Rate</p>
              <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                {stats.cacheHitRate.toFixed(1)}%
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Excellent efficiency
              </p>
            </div>
            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <Database className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Credit Usage Chart */}
      <CreditUsageChart data={stats.creditUsageHistory} />

      {/* Enrichment Stats */}
      <EnrichmentStatsWidget stats={stats.enrichmentStats} />

      {/* Organizations Table */}
      <OrganizationOverviewTable
        organizations={stats.organizations}
        onOrganizationClick={(org) => setSelectedOrg(org)}
      />

      {/* Organization Detail Modal */}
      {selectedOrg && (
        <OrganizationDetailModal
          organization={selectedOrg}
          onClose={() => setSelectedOrg(null)}
        />
      )}
    </div>
  );
}
