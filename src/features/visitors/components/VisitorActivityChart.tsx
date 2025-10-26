import { BarChart } from '../../../shared/components/charts';
import type { Visitor } from '../../../shared/types';
import type { VisitorAnalytics } from '../../../services/dashboardApi';

interface VisitorActivityChartProps {
  visitors: Visitor[];
  analytics?: VisitorAnalytics;
}

export function VisitorActivityChart({ visitors, analytics }: VisitorActivityChartProps) {
  // Helper function to convert 24-hour to 12-hour format
  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12} ${period}`;
  };

  // Use analytics data if available, otherwise calculate from visitors
  let recentData: { label: string; value: number }[] = [];

  if (analytics && analytics.visitorActivityByHour.length > 0) {
    // Use data from analytics API with 12-hour format
    recentData = analytics.visitorActivityByHour.map((item: any) => ({
      label: formatHour(parseInt(item.hour)),
      value: item.visitor_count || 0,
    }));
  } else {
    // Fallback: Calculate from visitors array
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const visitorsInHour = visitors.filter(v => {
        const visitorHour = new Date(v.timestamp).getHours();
        return visitorHour === hour;
      }).length;

      return {
        label: formatHour(hour),
        value: visitorsInHour,
      };
    });

    // Get recent activity (last 7 hours)
    const currentHour = new Date().getHours();
    recentData = hourlyData
      .slice(Math.max(0, currentHour - 6), currentHour + 1)
      .map(d => ({
        label: d.label,
        value: d.value,
      }));
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Visitor Activity
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Visitors by hour (last 7 hours)
        </p>
      </div>

      <div className="h-64">
        <BarChart 
          data={recentData}
          color="rgb(59, 130, 246)"
        />
      </div>
    </div>
  );
}

