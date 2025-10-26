import { Users, Eye, TrendingUp, Clock } from 'lucide-react';
import type { Visitor } from '../../../shared/types';
import type { VisitorAnalytics } from '../../../services/dashboardApi';

interface VisitorStatsCardsProps {
  visitors: Visitor[];
  analytics: VisitorAnalytics;
}

export function VisitorStatsCards({ visitors, analytics }: VisitorStatsCardsProps) {
  // Use analytics data from API
  const totalVisitors = analytics.totalVisitors;
  const activeVisitors = analytics.activeVisitors;
  const totalPageViews = analytics.totalPageViews;
  const avgPageViews = Math.round(analytics.avgPageViewsPerVisitor);
  const avgTimeOnSite = Math.round(analytics.avgTimeOnSite / 60); // Convert seconds to minutes
  const engagementRate = Math.round(analytics.engagementRate);

  // Calculate engaged visitors from engagement rate
  const engagedVisitors = totalVisitors > 0
    ? Math.round((engagementRate / 100) * totalVisitors)
    : 0;

  const stats = [
    {
      title: 'Total Visitors',
      value: totalVisitors.toString(),
      subtitle: `${activeVisitors} active now`,
      icon: Users,
      color: 'blue',
      trend: null,
    },
    {
      title: 'Total Page Views',
      value: totalPageViews.toString(),
      subtitle: `${avgPageViews} avg per visitor`,
      icon: Eye,
      color: 'purple',
      trend: null,
    },
    {
      title: 'Engagement Rate',
      value: `${engagementRate}%`,
      subtitle: `${engagedVisitors} engaged visitors`,
      icon: TrendingUp,
      color: 'green',
      trend: engagementRate > 50 ? 'up' : null,
    },
    {
      title: 'Avg Time on Site',
      value: `${avgTimeOnSite}m`,
      subtitle: 'Per visitor session',
      icon: Clock,
      color: 'orange',
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: 'blue' | 'purple' | 'green' | 'orange';
  trend: 'up' | 'down' | null;
}

function StatCard({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-500 to-blue-600',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      gradient: 'from-purple-500 to-purple-600',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      gradient: 'from-green-500 to-green-600',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'text-orange-600 dark:text-orange-400',
      gradient: 'from-orange-500 to-orange-600',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        {trend && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            trend === 'up' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {trend === 'up' ? '↑' : '↓'}
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}

