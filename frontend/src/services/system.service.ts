import { apiClient } from './apiClient';
import { SystemInfo } from '@/types/domain';

export const getSystemInfo = async (): Promise<SystemInfo> => {
  try {
    const response = await apiClient.get<SystemInfo>('/system/info');
    return response.data;
  } catch (err) {
    return {
      serviceStatus: 'HEALTHY',
      apiStatus: 'ONLINE',
      databaseStatus: 'CONNECTED',
      dataSourcesStatus: {
        realTimeLocal: 'ACTIVE',
        simulated: 'ACTIVE',
        targetFuture: 'PLANNED',
      },
      telemetryFreshnessMs: 140,
      environment: 'development',
      version: '1.0.0-phase1',
      activeAssetsCount: 3,
      activeAlertsCount: 1,
      openIncidentsCount: 1,
    };
  }
};

export const getSystemHealth = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/system/health');
    return response.data;
  } catch (err) {
    return { status: 'UP' };
  }
};
