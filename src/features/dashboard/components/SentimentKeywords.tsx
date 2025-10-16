import { useState } from 'react';
import { BarChart } from '../../../shared/components/charts';
import { TrendingUp, MessageSquare, Building2 } from 'lucide-react';

// Mock sentiment data
const sentimentData = [
  { label: 'Positive', value: 542, color: '#10b981' },
  { label: 'Neutral', value: 268, color: '#3b82f6' },
  { label: 'Negative', value: 95, color: '#ef4444' }
];

// Mock top companies data with colorful bars
const companiesData = [
  { label: 'TechFlow Inc', value: 287, color: '#ec4899' },
  { label: 'DataVision Corp', value: 245, color: '#8b5cf6' },
  { label: 'CloudScale Solutions', value: 198, color: '#3b82f6' },
  { label: 'InnovateLabs', value: 176, color: '#10b981' }
];

export function SentimentKeywords() {
  const [hoveredCompany, setHoveredCompany] = useState<number | null>(null);
  const totalSentiment = sentimentData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sentiment Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Sentiment Analysis
            </h3>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {totalSentiment} total calls
          </span>
        </div>

        <div className="mb-6 flex-1">
          <BarChart data={sentimentData} height={240} showValues={true} showGridlines={true} />
        </div>

        {/* Sentiment Breakdown */}
        <div className="space-y-3 mb-6">
          {sentimentData.map((item, index) => {
            const percentage = ((item.value / totalSentiment) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.value} calls
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sentiment Insights */}
        <div className="mt-auto">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                  Positive Trend
                </h4>
                <p className="text-xs text-green-700 dark:text-green-300">
                  60% of calls have positive sentiment, up 8% from last month
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Companies */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Top Companies
            </h3>
          </div>
        </div>

        {/* Companies List with Bars */}
        <div className="space-y-5 flex-1">
          {companiesData.map((company, index) => {
            const maxValue = Math.max(...companiesData.map(c => c.value));
            const widthPercent = (company.value / maxValue) * 100;
            const isHovered = hoveredCompany === index;

            return (
              <div
                key={index}
                className="space-y-2 cursor-pointer transition-all duration-200"
                style={{
                  transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                  opacity: hoveredCompany !== null && !isHovered ? 0.5 : 1
                }}
                onMouseEnter={() => setHoveredCompany(index)}
                onMouseLeave={() => setHoveredCompany(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full transition-all duration-200"
                      style={{
                        backgroundColor: company.color,
                        boxShadow: isHovered ? `0 0 12px ${company.color}` : 'none',
                        transform: isHovered ? 'scale(1.2)' : 'scale(1)'
                      }}
                    />
                    <span className={`text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 ${
                      isHovered ? 'font-bold text-gray-900 dark:text-gray-100' : ''
                    }`}>
                      {company.label}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold text-gray-900 dark:text-gray-100 transition-all duration-200 ${
                    isHovered ? 'text-base font-bold' : ''
                  }`}>
                    {company.value}
                  </span>
                </div>
                <div className="relative w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  {/* Background shimmer effect */}
                  {isHovered && (
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                      style={{
                        animation: 'shimmer 1.5s infinite',
                      }}
                    />
                  )}

                  {/* Bar */}
                  <div
                    className="h-full rounded-full transition-all duration-500 relative overflow-hidden"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: company.color,
                      boxShadow: isHovered ? `0 2px 8px ${company.color}80` : 'none',
                      filter: isHovered ? 'brightness(1.15)' : 'brightness(1)'
                    }}
                  >
                    {/* Inner gradient highlight */}
                    <div
                      className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Companies Insights */}
        <div className="mt-auto pt-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Top Performers
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  TechFlow Inc and DataVision Corp received the most outbound calls this week
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
