import { apiClient } from './apiClient';
import { AutomationLog } from '@/types/domain';
import { mockAutomationLogs } from './mockData';

export const getAutomationLogs = async (): Promise<AutomationLog[]> => {
  try {
    const { data } = await apiClient.get<AutomationLog[]>('/automation-logs');
    return data;
  } catch (err) {
    return mockAutomationLogs;
  }
};

export const createAutomationLog = async (log: Partial<AutomationLog>): Promise<AutomationLog> => {
  try {
    const { data } = await apiClient.post<AutomationLog>('/automation-logs', log);
    return data;
  } catch (err) {
    return {
      id: `log-${Date.now()}`,
      actionName: log.actionName || 'MANUAL_REMEDIATION',
      targetId: log.targetId || 'SYSTEM',
      executedBy: log.executedBy || 'IRISYN Operator',
      status: log.status || 'SUCCESS',
      timestamp: new Date().toISOString(),
      details: log.details || 'Remediation completed in fallback mode',
    };
  }
};
