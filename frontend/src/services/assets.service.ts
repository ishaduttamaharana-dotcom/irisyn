import { apiClient } from './apiClient';
import { Asset } from '@/types/domain';

export const getAssets = async (source?: string): Promise<Asset[]> => {
  const params = source && source !== 'ALL' ? { source } : {};
  const response = await apiClient.get<Asset[]>('/assets', { params });
  return response.data;
};

export const getAssetById = async (id: string): Promise<Asset> => {
  const response = await apiClient.get<Asset>(`/assets/${id}`);
  return response.data;
};

export const setSimulationScenario = async (name: string): Promise<any> => {
  const response = await apiClient.post('/assets/simulation/scenario', null, {
    params: { name },
  });
  return response.data;
};

export const toggleSimulationPause = async (paused: boolean): Promise<any> => {
  const response = await apiClient.post('/assets/simulation/pause', null, {
    params: { paused },
  });
  return response.data;
};

export const setSimulationSpeed = async (multiplier: number): Promise<any> => {
  const response = await apiClient.post('/assets/simulation/speed', null, {
    params: { multiplier },
  });
  return response.data;
};

export const getTelemetryStatus = async (): Promise<any> => {
  const response = await apiClient.get('/system/telemetry-status');
  return response.data;
};
