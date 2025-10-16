import type { Agent, Call, DashboardMetrics, KeywordTrend } from '../shared/types';

// Placeholder API implementation
export const agentApi = {
  getAll: async (): Promise<Agent[]> => {
    // TODO: Implement actual API call
    return [];
  },
};

export const callsApi = {
  getAll: async (agentId?: string, from?: string, to?: string): Promise<Call[]> => {
    // TODO: Implement actual API call
    return [];
  },
  getMetrics: async (agentId?: string, from?: string, to?: string): Promise<DashboardMetrics> => {
    // TODO: Implement actual API call
    return {
      totalCalls: 0,
      answeredCalls: 0,
      unansweredCalls: 0,
      answerRate: 0,
      spanishCallsPercent: 0,
      englishCallsPercent: 0,
      avgSummaryLength: 0,
      qualifiedLeadsCount: 0,
      qualificationRate: 0,
      appointmentDetectionRate: 0,
      crmSuccessRate: 0,
      avgSentiment: 0,
      avgHandlingTime: 0,
      automationRate: 0,
    };
  },
  getKeywordTrends: async (agentId?: string): Promise<KeywordTrend[]> => {
    // TODO: Implement actual API call
    return [];
  },
};

export const metricsApi = {
  // Add metrics API methods as needed
};
