import { TrendingUp, Eye, Clock } from 'lucide-react';
import type { Visitor } from '../../../shared/types';

interface TopCompaniesWidgetProps {
  visitors: Visitor[];
}

export function TopCompaniesWidget({ visitors }: TopCompaniesWidgetProps) {
  // Calculate engagement score for each visitor
  const visitorScores = visitors.map(v => {
    const timeSpent = (Date.now() - new Date(v.timestamp).getTime()) / 60000; // minutes
    const engagementScore = v.pageViews * 10 + timeSpent;
    
    return {
      ...v,
      engagementScore,
      timeSpent,
    };
  });

  // Sort by engagement score and get top 5
  const topVisitors = visitorScores
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Most Engaged Visitors
        </h3>
      </div>

      <div className="space-y-4">
        {topVisitors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No visitors yet
            </p>
          </div>
        ) : (
          topVisitors.map((visitor, index) => {
            const visitorKey = visitor.visitorId || visitor.id || `visitor-${index}`;
            return (
              <div 
                key={visitorKey}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
              {/* Rank Badge */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0 
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                  : index === 1
                  ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900'
                  : index === 2
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {index + 1}
              </div>

              {/* Company Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {visitor.company}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {visitor.lastRole} • {visitor.location}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-xs">
                  <Eye className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {visitor.pageViews}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {Math.round(visitor.timeSpent)}m
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className={`w-2 h-2 rounded-full ${
                visitor.status === 'active' 
                  ? 'bg-green-500 animate-pulse'
                  : visitor.status === 'video_invited'
                  ? 'bg-blue-500'
                  : 'bg-purple-500'
              }`} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

