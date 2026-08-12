import { apiClient } from './apiClient';
import { Asset } from '@/types/domain';

export interface TwinStateHistoryItem {
  timestamp: string;
  assetId: string;
  stateVersion?: number;
  previousMode: string;
  newMode: string;
  triggerReason: string;
  healthScore: number;
}

export interface TwinSensorItem {
  id: string;
  name: string;
  type: string;
  status: 'CONNECTED' | 'STALE' | 'OFFLINE' | 'DEGRADED' | 'ERROR';
  health: number;
}

export interface TwinTimelineItem {
  id: string;
  timestamp: string;
  type: string;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface TwinRelations {
  assetId: string;
  name: string;
  parentLocation: string;
  dependentAssets: string[];
  sensors: string[];
  telemetryStreams: string[];
  alerts: string[];
  anomalies: string[];
  predictions: string[];
  maintenance: string[];
}

export const getDigitalTwins = async (source?: string): Promise<Asset[]> => {
  try {
    const response = await apiClient.get<Asset[]>('/twins', { params: { source } });
    return response.data;
  } catch (err) {
    return [];
  }
};

export const getDigitalTwin = async (id: string): Promise<Asset | null> => {
  try {
    const response = await apiClient.get<Asset>(`/twins/${id}`);
    return response.data;
  } catch (err) {
    return null;
  }
};

export const getDigitalTwinState = async (id: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/twins/${id}/state`);
    return response.data;
  } catch (err) {
    return null;
  }
};

export const getDigitalTwinHistory = async (id: string): Promise<TwinStateHistoryItem[]> => {
  try {
    const response = await apiClient.get<TwinStateHistoryItem[]>(`/twins/${id}/history`);
    return response.data;
  } catch (err) {
    return [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        assetId: id,
        stateVersion: 12,
        previousMode: 'IDLE',
        newMode: 'RUNNING',
        triggerReason: 'System initialization & state engine sync',
        healthScore: 98,
      },
    ];
  }
};

export const getDigitalTwinTimeline = async (id: string): Promise<TwinTimelineItem[]> => {
  try {
    const response = await apiClient.get<TwinTimelineItem[]>(`/twins/${id}/timeline`);
    return response.data;
  } catch (err) {
    return [];
  }
};

export const getDigitalTwinRelations = async (id: string): Promise<TwinRelations | null> => {
  try {
    const response = await apiClient.get<TwinRelations>(`/twins/${id}/relations`);
    return response.data;
  } catch (err) {
    return null;
  }
};

export const getDigitalTwinSensors = async (id: string): Promise<TwinSensorItem[]> => {
  try {
    const response = await apiClient.get<TwinSensorItem[]>(`/twins/${id}/sensors`);
    return response.data;
  } catch (err) {
    return [
      { id: 'SENS-01', name: 'Thermal Sensor', type: 'TEMPERATURE', status: 'CONNECTED', health: 100 },
      { id: 'SENS-02', name: 'Accelerometer', type: 'VIBRATION', status: 'CONNECTED', health: 92 },
    ];
  }
};

export const updateOperatingMode = async (id: string, mode: string): Promise<any> => {
  const response = await apiClient.put(`/twins/${id}/operating-mode`, { mode });
  return response.data;
};
