import { X, Users, Activity, Video, Star, Clock, DollarSign, Database, TrendingUp, Calendar, Link as LinkIcon } from 'lucide-react';

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

interface OrganizationDetailModalProps {
  organization: OrganizationData;
  onClose: () => void;
}

export function OrganizationDetailModal({ organization, onClose }: OrganizationDetailModalProps) {
  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '0 seconds';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} seconds`;
    if (secs === 0) return `${mins} minutes`;
    return `${mins} minutes ${secs} seconds`;
  };

  const connectionRate = organization.totalInvites > 0
    ? Math.round((organization.connectedCalls / organization.totalInvites) * 100)
    : 0;

  const leadConversionRate = organization.connectedCalls > 0
    ? Math.round((organization.qualifiedLeads / organization.connectedCalls) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {organization.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {organization.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Organization ID: {organization.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              icon={Users}
              label="Active Users"
              value={organization.totalUsers.toString()}
              color="purple"
            />
            <MetricCard
              icon={Activity}
              label="Total Visitors"
              value={organization.totalVisitors.toLocaleString()}
              color="green"
            />
            <MetricCard
              icon={Video}
              label="Video Calls"
              value={organization.totalVideoCalls.toString()}
              subtext={`${organization.connectedCalls} connected`}
              color="blue"
            />
            <MetricCard
              icon={Star}
              label="Qualified Leads"
              value={organization.qualifiedLeads.toString()}
              color="yellow"
            />
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Connection Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Connection Rate
                  </span>
                  <span className={`text-lg font-bold ${
                    connectionRate >= 70 ? 'text-green-600 dark:text-green-400' :
                    connectionRate >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {connectionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      connectionRate >= 70 ? 'bg-green-500' :
                      connectionRate >= 40 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${connectionRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {organization.connectedCalls} of {organization.totalInvites} invites connected
                </p>
              </div>

              {/* Lead Conversion Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Lead Conversion Rate
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {leadConversionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${leadConversionRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {organization.qualifiedLeads} qualified from {organization.connectedCalls} calls
                </p>
              </div>
            </div>
          </div>

          {/* Call Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                Call Duration Analytics
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Duration</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDuration(organization.avgCallDuration)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Calls</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {organization.totalVideoCalls}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Successful Connections</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {organization.connectedCalls}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-500" />
                Enrichment Usage
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">API Credits Used</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {organization.creditsUsed}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cache Hits</span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {organization.cacheHits}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Lookups</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {organization.creditsUsed + organization.cacheHits}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* API Key Information */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Integration Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                  API Key
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm font-mono text-gray-900 dark:text-gray-100">
                    {organization.apiKey}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(organization.apiKey)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                    Status
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                    organization.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                  }`}>
                    {organization.status === 'active' ? '● Active' : '○ Inactive'}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                    Last Activity
                  </label>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(organization.lastActivity).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  color: 'purple' | 'green' | 'blue' | 'yellow';
}

function MetricCard({ icon: Icon, label, value, subtext, color }: MetricCardProps) {
  const colorClasses = {
    purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 text-purple-600 dark:text-purple-400',
    green: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-green-600 dark:text-green-400',
    blue: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-600 dark:text-blue-400',
    yellow: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${colorClasses[color].split(' ').slice(-1)}`} />
        <span className={`text-sm font-medium ${colorClasses[color].split(' ').slice(-1)}`}>
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      {subtext && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{subtext}</p>
      )}
    </div>
  );
}
