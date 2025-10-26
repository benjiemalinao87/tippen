import { useEffect, useState } from 'react';
import {
  Phone,
  PhoneOutgoing,
  Globe,
  FileText,
  Target,
  Calendar,
  Database,
  TrendingUp,
  Clock
} from 'lucide-react';
import { MetricCard } from '../../../shared/components/ui';
import { LineChart } from '../../../shared/components/charts';
import { BarChart } from '../../../shared/components/charts';
import { DonutChart } from '../../../shared/components/charts';
import { SentimentKeywords } from './SentimentKeywords';
import { MultiLineChart } from '../../../shared/components/charts';
import { callsApi, metricsApi } from '../../../lib/api';
import type { DashboardMetrics, Call, KeywordTrend } from '../../../shared/types';
import { getDashboardMetrics, getCallVolume, getTopCompanies } from '../../../services/dashboardApi';

interface PerformanceDashboardProps {
  selectedAgentId?: string;
  dateRange: { from: string; to: string };
}

export function PerformanceDashboard({ selectedAgentId, dateRange }: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [keywords, setKeywords] = useState<KeywordTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedAgentId, dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch real analytics data from D1
      const realMetrics = await getDashboardMetrics();

      // Also fetch the existing mock data for backward compatibility
      const [metricsData, callsData, keywordsData] = await Promise.all([
        callsApi.getMetrics(selectedAgentId, dateRange.from, dateRange.to),
        callsApi.getAll(selectedAgentId, dateRange.from, dateRange.to),
        callsApi.getKeywordTrends(selectedAgentId)
      ]);

      // Merge real metrics with mock data structure
      const mergedMetrics = {
        ...metricsData,
        // Override with real data from D1
        totalCalls: realMetrics.totalOutboundCalls,
        answeredCalls: Math.round(realMetrics.totalOutboundCalls * (realMetrics.connectionRate / 100)),
        unansweredCalls: realMetrics.totalOutboundCalls - Math.round(realMetrics.totalOutboundCalls * (realMetrics.connectionRate / 100)),
        answerRate: realMetrics.connectionRate,
        qualifiedLeadsCount: realMetrics.qualifiedLeads,
        avgHandlingTime: realMetrics.avgCallDuration,
      };

      setMetrics(mergedMetrics);
      setCalls(callsData);
      setKeywords(keywordsData);

      console.log('📊 Dashboard loaded with REAL data from D1:', realMetrics);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for call volume trends - 7 days with realistic patterns
  const callVolumeLabels = ['Jan 8', 'Jan 9', 'Jan 10', 'Jan 11', 'Jan 12', 'Jan 13', 'Jan 14'];

  // Realistic call volume data showing weekly trends for outbound calls
  const totalOutboundData = [52, 58, 65, 48, 61, 55, 63];
  const connectedData = [45, 51, 58, 41, 53, 48, 56];
  const noAnswerData = [7, 7, 7, 7, 8, 7, 7];

  const callVolumeSeries = [
    {
      name: 'Total Outbound',
      data: callVolumeLabels.map((label, i) => ({
        label,
        value: totalOutboundData[i]
      })),
      color: '#3b82f6' // Blue
    },
    {
      name: 'Connected',
      data: callVolumeLabels.map((label, i) => ({
        label,
        value: connectedData[i]
      })),
      color: '#10b981' // Green
    },
    {
      name: 'No Answer',
      data: callVolumeLabels.map((label, i) => ({
        label,
        value: noAnswerData[i]
      })),
      color: '#ef4444' // Red
    }
  ];

  const sentimentData = calls
    .filter(c => c.was_answered)
    .slice(-7)
    .map((call, i) => ({
      label: `Call ${i + 1}`,
      value: (call.sentiment_score + 1) * 50
    }));

  const languageData = [
    { label: 'English', value: Math.round(metrics?.englishCallsPercent || 0), color: '#3b82f6' },
    { label: 'Spanish', value: Math.round(metrics?.spanishCallsPercent || 0), color: '#8b5cf6' }
  ];

  const keywordData = keywords.slice(0, 8).map(k => ({
    label: k.keyword,
    value: k.count,
    color: '#10b981'
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No data available for selected filters
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Outbound Calls"
          value={metrics.totalCalls.toLocaleString()}
          subtitle={`${metrics.answeredCalls} connected, ${metrics.unansweredCalls} no answer`}
          icon={Phone}
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Connection Rate"
          value={`${metrics.answerRate.toFixed(1)}%`}
          subtitle="Calls successfully connected"
          icon={PhoneOutgoing}
          iconColor="text-green-600"
        />
        <MetricCard
          title="Qualified Leads"
          value={metrics.qualifiedLeadsCount}
          subtitle={`${metrics.qualificationRate.toFixed(1)}% of connected calls`}
          icon={Target}
          iconColor="text-orange-600"
        />
        <MetricCard
          title="Avg Call Duration"
          value={`${Math.floor(metrics.avgHandlingTime / 60)}:${String(Math.floor(metrics.avgHandlingTime % 60)).padStart(2, '0')}`}
          subtitle="Minutes:seconds per call"
          icon={Clock}
          iconColor="text-slate-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Outbound Call Volume</h3>
            <TrendingUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <MultiLineChart series={callVolumeSeries} height={200} showLegend={true} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Language Distribution</h3>
            <Globe className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="flex justify-center py-4">
            <DonutChart data={languageData} size={200} innerSize={70} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Avg Call Summary"
          value={`${Math.round(metrics.avgSummaryLength)} chars`}
          subtitle="AI-generated call notes"
          icon={FileText}
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Appointments Booked"
          value={`${metrics.appointmentDetectionRate.toFixed(1)}%`}
          subtitle="Successful scheduling rate"
          icon={Calendar}
          iconColor="text-green-600"
        />
        <MetricCard
          title="CRM Integration"
          value={`${metrics.crmSuccessRate.toFixed(1)}%`}
          subtitle="Data sync success rate"
          icon={Database}
          iconColor="text-emerald-600"
        />
      </div>

      <SentimentKeywords />
    </div>
  );
}
