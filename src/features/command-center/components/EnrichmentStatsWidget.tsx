import { CheckCircle, XCircle, Database, Zap, Clock } from 'lucide-react';

interface EnrichmentStats {
  totalLookups: number;
  successfulLookups: number;
  failedLookups: number;
  cacheHits: number;
  cacheMisses: number;
  avgResponseTime: number;
}

interface EnrichmentStatsWidgetProps {
  stats: EnrichmentStats;
}

export function EnrichmentStatsWidget({ stats }: EnrichmentStatsWidgetProps) {
  const successRate = stats.totalLookups > 0
    ? (stats.successfulLookups / (stats.successfulLookups + stats.failedLookups)) * 100
    : 0;

  const cacheHitRate = stats.totalLookups > 0
    ? (stats.cacheHits / stats.totalLookups) * 100
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Enrichment Statistics</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          IP-to-company lookup performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Lookups */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Lookups</p>
          </div>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {stats.totalLookups.toLocaleString()}
          </p>
        </div>

        {/* Successful Lookups */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Successful</p>
          </div>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
            {stats.successfulLookups.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {successRate.toFixed(1)}% success rate
          </p>
        </div>

        {/* Failed Lookups */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Failed / No Data</p>
          </div>
          <p className="text-2xl font-semibold text-gray-600 dark:text-gray-400">
            {stats.failedLookups.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Residential IPs
          </p>
        </div>

        {/* Cache Performance */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Cache Hits</p>
          </div>
          <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
            {stats.cacheHits.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {cacheHitRate.toFixed(1)}% hit rate
          </p>
        </div>

        {/* Avg Response Time */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Avg Response</p>
          </div>
          <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
            {stats.avgResponseTime}ms
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            API latency
          </p>
        </div>
      </div>

      {/* Visual Breakdown */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lookup Sources</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {stats.totalLookups} total
              </span>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              <div
                className="bg-yellow-500 dark:bg-yellow-600"
                style={{ width: `${cacheHitRate}%` }}
                title={`Cache: ${stats.cacheHits} (${cacheHitRate.toFixed(1)}%)`}
              />
              <div
                className="bg-blue-500 dark:bg-blue-600"
                style={{ width: `${100 - cacheHitRate}%` }}
                title={`API: ${stats.cacheMisses} (${(100 - cacheHitRate).toFixed(1)}%)`}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span>💾 {stats.cacheHits} from cache</span>
              <span>🔍 {stats.cacheMisses} from API</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Success Rate</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {stats.successfulLookups + stats.failedLookups} API calls
              </span>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              <div
                className="bg-green-500 dark:bg-green-600"
                style={{ width: `${successRate}%` }}
                title={`Success: ${stats.successfulLookups} (${successRate.toFixed(1)}%)`}
              />
              <div
                className="bg-gray-400 dark:bg-gray-500"
                style={{ width: `${100 - successRate}%` }}
                title={`No data: ${stats.failedLookups} (${(100 - successRate).toFixed(1)}%)`}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span>✅ {stats.successfulLookups} enriched</span>
              <span>🏠 {stats.failedLookups} residential</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
