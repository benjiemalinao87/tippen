interface CreditUsageData {
  date: string;
  creditsUsed: number;
  creditsSaved: number;
}

interface CreditUsageChartProps {
  data: CreditUsageData[];
}

export function CreditUsageChart({ data }: CreditUsageChartProps) {
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.creditsUsed, d.creditsSaved))
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Credit Usage Trend</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Daily API credits used vs saved through caching
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Credits Used</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Credits Saved</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((item, index) => {
          const usedPercentage = (item.creditsUsed / maxValue) * 100;
          const savedPercentage = (item.creditsSaved / maxValue) * 100;

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 w-20">
                  {formatDate(item.date)}
                </span>
                <div className="flex-1 mx-4">
                  <div className="flex gap-2">
                    {/* Credits Used Bar */}
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                        <div
                          className="h-full bg-orange-500 dark:bg-orange-600 transition-all duration-300 flex items-center justify-end pr-2"
                          style={{ width: `${usedPercentage}%` }}
                        >
                          {item.creditsUsed > 0 && (
                            <span className="text-xs font-medium text-white">
                              {item.creditsUsed}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Credits Saved Bar */}
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                        <div
                          className="h-full bg-green-500 dark:bg-green-600 transition-all duration-300 flex items-center justify-end pr-2"
                          style={{ width: `${savedPercentage}%` }}
                        >
                          {item.creditsSaved > 0 && (
                            <span className="text-xs font-medium text-white">
                              {item.creditsSaved}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Used</p>
            <p className="text-2xl font-semibold text-orange-600 dark:text-orange-400 mt-1">
              {data.reduce((sum, item) => sum + item.creditsUsed, 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              ${(data.reduce((sum, item) => sum + item.creditsUsed, 0) * 0.05).toFixed(2)} spent
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Saved</p>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
              {data.reduce((sum, item) => sum + item.creditsSaved, 0)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              ${(data.reduce((sum, item) => sum + item.creditsSaved, 0) * 0.05).toFixed(2)} saved
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency</p>
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mt-1">
              {(() => {
                const totalUsed = data.reduce((sum, item) => sum + item.creditsUsed, 0);
                const totalSaved = data.reduce((sum, item) => sum + item.creditsSaved, 0);
                const efficiency = (totalSaved / (totalUsed + totalSaved)) * 100;
                return efficiency.toFixed(1);
              })()}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Cache hit rate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
