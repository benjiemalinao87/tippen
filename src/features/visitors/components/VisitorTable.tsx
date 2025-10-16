import { useState } from 'react';
import { Users, Phone, Eye } from 'lucide-react';
import type { Visitor } from '../../../shared/types';

interface VisitorTableProps {
  visitors: Visitor[];
  onViewDetails: (visitor: Visitor) => void;
  onStartCall: (visitor: Visitor) => void;
  activeCall: string | null;
  onToggleCall: (visitorId: string, enabled: boolean) => void;
}

export function VisitorTable({ visitors, onViewDetails, activeCall, onToggleCall }: VisitorTableProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'pageViews' | 'location'>('recent');

  // Sort visitors based on selected criteria
  const sortedVisitors = [...visitors].sort((a, b) => {
    switch (sortBy) {
      case 'pageViews':
        return b.pageViews - a.pageViews;
      case 'location':
        return a.location.localeCompare(b.location);
      case 'recent':
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'video_invited':
        return 'bg-blue-500';
      case 'in_call':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleBadgeColor = (role: string | undefined): string => {
    if (!role) return 'bg-gray-50/80 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    const roleLower = role.toLowerCase();

    // Executive roles - Purple
    if (roleLower.includes('ceo') || roleLower.includes('cto') || roleLower.includes('cfo') ||
        roleLower.includes('vp') || roleLower.includes('chief')) {
      return 'bg-purple-50/80 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700';
    }

    // Engineering/Technical - Green
    if (roleLower.includes('engineer') || roleLower.includes('developer') ||
        roleLower.includes('tech') || roleLower.includes('scientist')) {
      return 'bg-green-50/80 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700';
    }

    // Product/Manager - Blue
    if (roleLower.includes('product') || roleLower.includes('manager')) {
      return 'bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700';
    }

    // Sales/Marketing - Orange
    if (roleLower.includes('sales') || roleLower.includes('marketing') ||
        roleLower.includes('director')) {
      return 'bg-orange-50/80 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-700';
    }

    // Design/Creative - Pink
    if (roleLower.includes('design') || roleLower.includes('creative')) {
      return 'bg-pink-50/80 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-700';
    }

    // Founder/Owner - Amber
    if (roleLower.includes('founder') || roleLower.includes('owner')) {
      return 'bg-amber-50/80 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700';
    }

    // Default - Gray
    return 'bg-gray-50/80 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header with filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            All Visitors
          </h3>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="pageViews">Page Views</option>
              <option value="location">Location</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                Company
              </th>
              <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                Location
              </th>
              <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                Role
              </th>
              <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                Page Views
              </th>
              <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                Last Activity
              </th>
              <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider py-3 px-4">
                Video Call
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedVisitors.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No visitors yet. Waiting for traffic...
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedVisitors.map((visitor) => {
                const visitorId = visitor.visitorId || visitor.id || '';
                const isActiveCall = activeCall === visitorId;
                
                return (
                <tr 
                  key={visitor.visitorId} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => onViewDetails(visitor)}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(visitor.status)}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {visitor.company}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {visitor.website}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {visitor.location}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getRoleBadgeColor(visitor.lastRole)}`}>
                      {visitor.lastRole || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {visitor.pageViews}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {visitor.lastActivity}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCall(visitorId, !isActiveCall);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isActiveCall
                            ? 'bg-blue-600 dark:bg-blue-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        title={isActiveCall ? 'End video call' : 'Start video call'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isActiveCall ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

