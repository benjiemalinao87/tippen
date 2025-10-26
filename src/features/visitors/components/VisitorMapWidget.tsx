import { MapPin, Globe } from 'lucide-react';
import type { Visitor } from '../../../shared/types';
import type { VisitorAnalytics } from '../../../services/dashboardApi';

interface VisitorMapWidgetProps {
  visitors: Visitor[];
  analytics?: VisitorAnalytics;
}

export function VisitorMapWidget({ visitors, analytics }: VisitorMapWidgetProps) {
  // Use analytics location breakdown if available, otherwise use live visitors
  let topLocations: [string, number][] = [];
  let maxCount = 0;

  if (analytics && analytics.locationBreakdown && analytics.locationBreakdown.length > 0) {
    // Use location data from analytics API
    topLocations = analytics.locationBreakdown.map((item: any) => [
      item.location,
      item.visitor_count
    ]) as [string, number][];
    maxCount = Math.max(...topLocations.map(([, count]) => count), 1);
  } else {
    // Fallback: Group live visitors by location
    const locationCounts = visitors.reduce((acc, visitor) => {
      const location = visitor.location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort by count and get top locations
    topLocations = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);

    maxCount = Math.max(...topLocations.map(([, count]) => count), 1);
  }

  const locationCounts = topLocations.reduce((acc, [location, count]) => {
    acc[location] = count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Visitor Locations
        </h3>
      </div>

      <div className="space-y-4">
        {topLocations.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No location data available
            </p>
          </div>
        ) : (
          topLocations.map(([location, count]) => {
            const percentage = (count / maxCount) * 100;
            
            return (
              <div key={location} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {location}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 ml-2">
                    {count}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Total */}
      {topLocations.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total Locations
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {Object.keys(locationCounts).length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

