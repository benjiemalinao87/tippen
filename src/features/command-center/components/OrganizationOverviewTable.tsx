import { Activity, Users, Video, CheckCircle, Star, Clock, ChevronRight } from 'lucide-react';

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

interface OrganizationOverviewTableProps {
  organizations: OrganizationData[];
  onOrganizationClick?: (org: OrganizationData) => void;
}

export function OrganizationOverviewTable({ organizations, onOrganizationClick }: OrganizationOverviewTableProps) {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const connectionRate = (org: OrganizationData) => {
    if (org.totalInvites === 0) return 0;
    return Math.round((org.connectedCalls / org.totalInvites) * 100);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Organizations</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Click any organization to view detailed analytics
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Users
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Visitors
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Video Calls
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Connection Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Qualified Leads
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Avg Call Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {organizations.map((org) => (
              <tr
                key={org.id}
                onClick={() => onOrganizationClick?.(org)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {org.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {org.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {org.apiKey.substring(0, 20)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{org.totalUsers}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {org.totalVisitors.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {org.totalVideoCalls}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {org.connectedCalls} connected
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${
                          connectionRate(org) >= 70 ? 'text-green-600 dark:text-green-400' :
                          connectionRate(org) >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {connectionRate(org)}%
                        </span>
                      </div>
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            connectionRate(org) >= 70 ? 'bg-green-500' :
                            connectionRate(org) >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${connectionRate(org)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {org.qualifiedLeads}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDuration(org.avgCallDuration)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(org.lastActivity)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                    org.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                  }`}>
                    {org.status === 'active' ? '● Active' : '○ Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOrganizationClick?.(org);
                    }}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {organizations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No organizations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
