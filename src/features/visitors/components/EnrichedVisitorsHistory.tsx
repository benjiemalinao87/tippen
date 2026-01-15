import { useState, useEffect } from 'react';
import { Building2, Globe, Users, TrendingUp, Sparkles, Database, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { getUserApiKey } from '../../../shared/utils/auth';

interface EnrichedVisitor {
  visitorId: string;
  company: string;
  domain: string | null;
  industry: string | null;
  revenue: string | null;
  staff: number | null;
  employees: number | null;
  enrichedLocation: string | null;
  location: string;
  lastRole: string | null;
  website: string | null;
  pageViews: number;
  firstSeenAt: string;
  lastSeenAt: string;
  _enrichmentSource: 'enrich_so' | 'cache' | 'fallback';
  _cached: boolean;
  enrichedAt: string | null;
}

interface EnrichmentStats {
  totalVisitors: number;
  enrichedVisitors: number;
  uniqueIndustries: number;
  enrichmentRate: number;
}

const IMPERSONATION_STORAGE_KEY = 'tippen_impersonation';

function getActiveApiKey(): string | null {
  try {
    // First check if we're impersonating another organization
    const impersonationStr = localStorage.getItem(IMPERSONATION_STORAGE_KEY);
    if (impersonationStr) {
      const impersonation = JSON.parse(impersonationStr);
      if (impersonation.targetOrganization?.apiKey) {
        return impersonation.targetOrganization.apiKey;
      }
    }
    // Fall back to user's own API key
    return getUserApiKey();
  } catch {
    return getUserApiKey();
  }
}

export function EnrichedVisitorsHistory() {
  const [visitors, setVisitors] = useState<EnrichedVisitor[]>([]);
  const [stats, setStats] = useState<EnrichmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchEnrichedVisitors = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = getActiveApiKey();
      if (!apiKey) {
        setError('No API key found');
        setLoading(false);
        return;
      }

      const backendUrl = import.meta.env.VITE_VISITOR_WS_URL
        ?.replace('ws://', 'http://')
        .replace('wss://', 'https://')
        .replace('/ws/dashboard', '') || 'https://tippen-backend.benjiemalinao879557.workers.dev';

      const response = await fetch(
        `${backendUrl}/api/analytics/enriched-visitors?api_key=${apiKey}&limit=50&enriched_only=true`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch enriched visitors');
      }

      const data = await response.json();
      setVisitors(data.visitors || []);
      setStats(data.stats || null);
    } catch (err: any) {
      console.error('Error fetching enriched visitors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrichedVisitors();

    // Listen for impersonation changes
    const handleImpersonationChange = () => {
      fetchEnrichedVisitors();
    };
    window.addEventListener('tippen-impersonation-change', handleImpersonationChange);
    return () => window.removeEventListener('tippen-impersonation-change', handleImpersonationChange);
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEnrichmentIcon = (source: string, cached: boolean) => {
    if (source === 'enrich_so' && cached) {
      return <Database className="w-4 h-4 text-green-500" title="From cache (0 credits)" />;
    }
    if (source === 'enrich_so') {
      return <Sparkles className="w-4 h-4 text-blue-500" title="Freshly enriched (1 credit)" />;
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div 
        className="p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Enriched Visitors History
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Historical visitors with company data from Enrich.so
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {stats && (
              <div className="flex items-center gap-4 mr-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.enrichedVisitors}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enriched</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.enrichmentRate}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rate</p>
                </div>
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchEnrichedVisitors();
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <button
                onClick={fetchEnrichedVisitors}
                className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : visitors.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No enriched visitors yet. Visitors will appear here once the Enrich.so API identifies their company.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                      Company
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                      Industry
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                      Revenue
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                      Location
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                      Page Views
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                      Last Seen
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {visitors.map((visitor) => (
                    <tr 
                      key={visitor.visitorId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {visitor.company}
                            </p>
                            {visitor.domain && (
                              <a 
                                href={`https://${visitor.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                              >
                                <Globe className="w-3 h-3" />
                                {visitor.domain}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {visitor.industry || (
                            <span className="text-gray-400 dark:text-gray-500 italic">—</span>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {visitor.revenue ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md text-xs font-medium">
                            <TrendingUp className="w-3 h-3" />
                            {visitor.revenue}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic text-sm">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {visitor.enrichedLocation || visitor.location || (
                            <span className="text-gray-400 dark:text-gray-500 italic">—</span>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {visitor.pageViews}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(visitor.lastSeenAt)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getEnrichmentIcon(visitor._enrichmentSource, visitor._cached)}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {visitor._enrichmentSource === 'enrich_so' 
                              ? (visitor._cached ? 'Cached' : 'API')
                              : visitor._enrichmentSource}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
