import { apiClient } from './apiClient';
import { Asset } from '@/types/domain';
import { mockAssets } from './mockData';

export const getAssets = async (source?: string): Promise<Asset[]> => {
  try {
    const params = source && source !== 'ALL' ? { source } : {};
    const response = await apiClient.get<Asset[]>('/assets', { params });
    return response.data;
  } catch (err) {
    if (source && source !== 'ALL') {
      return mockAssets.filter((a) => a.source === source);
    }
    return mockAssets;
  }
};

export const getAssetById = async (id: string): Promise<Asset> => {
  try {
    const response = await apiClient.get<Asset>(`/assets/${id}`);
    return response.data;
  } catch (err) {
    return mockAssets.find((a) => a.id === id) || mockAssets[0];
  }
};

export const setSimulationScenario = async (name: string): Promise<any> => {
  try {
    const response = await apiClient.post('/assets/simulation/scenario', null, {
      params: { name },
    });
    return response.data;
  } catch (err) {
    return { status: 'SUCCESS', scenario: name, message: `Simulation scenario set to ${name}` };
  }
};

export const toggleSimulationPause = async (paused: boolean): Promise<any> => {
  try {
    const response = await apiClient.post('/assets/simulation/pause', null, {
      params: { paused },
    });
    return response.data;
  } catch (err) {
    return { status: 'SUCCESS', paused, message: `Simulation ${paused ? 'paused' : 'resumed'}` };
  }
};

export const setSimulationSpeed = async (multiplier: number): Promise<any> => {
  try {
    const response = await apiClient.post('/assets/simulation/speed', null, {
      params: { multiplier },
    });
    return response.data;
  } catch (err) {
    return { status: 'SUCCESS', speedMultiplier: multiplier };
  }
};

export const getTelemetryStatus = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/system/telemetry-status');
    return response.data;
  } catch (err) {
    return {
      status: 'ONLINE',
      mode: 'SIMULATED + LOCAL HARDWARE',
      latencyMs: 12,
      dataPointsPerSec: 24,
      activeSources: 3,
    };
  }
};
