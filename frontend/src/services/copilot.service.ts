import { apiClient } from './apiClient';

export interface CopilotQuery {
  question: string;
  pageContext?: string;
  activeAssetId?: string;
  sessionId?: string;
}

export interface CopilotResponse {
  question: string;
  answer: string;
  evidence: string[];
  risk: string;
  recommendation: string;
  dataSourcesUsed: string[];
  confidence: 'CONFIRMED' | 'LIKELY' | 'POSSIBLE';

  // Data-First Attribution & Trace
  freshnessStatus?: 'LIVE' | 'STALE' | 'OFFLINE';
  freshnessSeconds?: number;
  dataUsedTrace?: string[];
  tableData?: Record<string, any>[];
  rootCauseTimeline?: string[];

  // Consequential Action Confirmation
  requiresActionConfirmation?: boolean;
  actionPayload?: {
    action?: string;
    target?: string;
    scenario?: string;
    description?: string;
  };
  suggestedQuestions?: string[];
  timestamp: string;
}

export interface CopilotStatus {
  aiStatus: 'ONLINE' | 'OFFLINE';
  dataConnection: 'LIVE' | 'DEGRADED';
  configuredModel: string;
  activeContextAssets: number;
  systemStatus: string;
  lastDataSync: string;
  latencyMs: number;
}

export const queryCopilot = async (payload: CopilotQuery): Promise<CopilotResponse> => {
  const response = await apiClient.post<CopilotResponse>('/copilot/query', payload);
  return response.data;
};

export const executeCopilotAction = async (action: string, target: string, scenario?: string): Promise<any> => {
  const response = await apiClient.post('/copilot/execute-action', null, {
    params: { action, target, scenario },
  });
  return response.data;
};

export const getCopilotStatus = async (): Promise<CopilotStatus> => {
  const response = await apiClient.get<CopilotStatus>('/copilot/status');
  return response.data;
};
