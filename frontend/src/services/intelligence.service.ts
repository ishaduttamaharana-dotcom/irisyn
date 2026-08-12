import { apiClient } from './apiClient';

export interface HealthOverviewItem {
  assetId: string;
  name?: string;
  source?: string;
  healthScore: number;
  status: string;
  operatingMode: string;
  healthBreakdown: Record<string, number>;
  modelVersion: string;
}

export interface AnomalyItem {
  id: string;
  assetId: string;
  metric: string;
  status: string;
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedValue: number;
  expectedValue: number;
  deviationSigma: number;
  detectedAt: string;
  evidence: string;
  inferenceCategory: 'OBSERVED' | 'INFERRED' | 'PREDICTED';
}

export interface PredictionItem {
  id: string;
  assetId: string;
  predictionType: string;
  riskScore: number;
  confidence: number;
  horizon: string;
  evidence: string;
  modelVersion: string;
  timestamp: string;
  inferenceCategory: 'OBSERVED' | 'INFERRED' | 'PREDICTED';
}

export interface TrendItem {
  assetId: string;
  metric: string;
  direction: 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE' | 'INSUFFICIENT_DATA';
  delta: number;
  sampleCount: number;
  confidence: number;
  description: string;
}

export interface EvidenceItem {
  category: 'OBSERVED' | 'INFERRED' | 'PREDICTED';
  metric: string;
  value: string;
  source?: string;
  baseline?: string;
  confidence?: string;
  timestamp: string;
}

export const getIntelligenceOverview = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/intelligence/overview');
    return response.data;
  } catch (err) {
    return null;
  }
};

export const getRiskRanking = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get<any[]>('/intelligence/risk-ranking');
    return response.data;
  } catch (err) {
    return [];
  }
};

export const getHealthRanking = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get<any[]>('/intelligence/health-ranking');
    return response.data;
  } catch (err) {
    return [];
  }
};

export const getAssetHealth = async (assetId: string): Promise<HealthOverviewItem | null> => {
  try {
    const response = await apiClient.get<HealthOverviewItem>(`/assets/${assetId}/health`);
    return response.data;
  } catch (err) {
    return null;
  }
};

export const getAssetAnomalies = async (assetId: string): Promise<AnomalyItem[]> => {
  try {
    const response = await apiClient.get<AnomalyItem[]>(`/assets/${assetId}/anomalies`);
    return response.data;
  } catch (err) {
    return [];
  }
};

export const getAssetTrends = async (assetId: string): Promise<TrendItem[]> => {
  try {
    const response = await apiClient.get<TrendItem[]>(`/assets/${assetId}/trends`);
    return response.data;
  } catch (err) {
    return [];
  }
};

export const getAssetPredictions = async (assetId: string): Promise<PredictionItem[]> => {
  try {
    const response = await apiClient.get<PredictionItem[]>(`/assets/${assetId}/predictions`);
    return response.data;
  } catch (err) {
    return [];
  }
};

export const getAssetEvidence = async (assetId: string): Promise<EvidenceItem[]> => {
  try {
    const response = await apiClient.get<EvidenceItem[]>(`/assets/${assetId}/evidence`);
    return response.data;
  } catch (err) {
    return [];
  }
};
