import { apiClient } from './apiClient';

export interface SystemConfigOverview {
  platformName: string;
  tagline: string;
  environment: string;
  defaultMode: string;
  timezone: string;
  collectionIntervalSec: number;
  telemetryTransport: string;
  staleThresholdSec: number;
  healthWeights: Record<string, number>;
  alertThresholds: Record<string, number>;
  featureFlags: Record<string, boolean>;
}

export interface SystemDiagnostics {
  overallStatus: string;
  totalDiagnosticsDurationMs: number;
  timestamp: string;
  components: Array<{
    name: string;
    status: 'CONNECTED' | 'HEALTHY' | 'RUNNING' | 'ONLINE' | 'TARGET / FUTURE' | 'ERROR';
    latencyMs: number;
    source: string;
    details?: string;
  }>;
}

export interface RbacMatrixRow {
  permission: string;
  ADMIN: boolean;
  ENGINEER: boolean;
  OPERATOR: boolean;
  VIEWER: boolean;
}

export interface AccessDecision {
  decision: 'ALLOWED' | 'DENIED';
  user: string;
  role: string;
  permission: string;
  resource: string;
  reason: string;
  timestamp: string;
}

export const getControlPlaneOverview = async (): Promise<SystemConfigOverview> => {
  const response = await apiClient.get<SystemConfigOverview>('/control-plane/overview');
  return response.data;
};

export const updateConfigParam = async (key: string, value: string, user = 'admin@irisyn.io', role = 'ADMIN'): Promise<any> => {
  const response = await apiClient.post('/control-plane/config', null, {
    params: { key, value, user, role },
  });
  return response.data;
};

export const updateHealthWeights = async (weights: Record<string, number>, user = 'admin@irisyn.io', role = 'ADMIN'): Promise<any> => {
  const response = await apiClient.post('/control-plane/health-weights', weights, {
    params: { user, role },
  });
  return response.data;
};

export const runDiagnostics = async (): Promise<SystemDiagnostics> => {
  const response = await apiClient.get<SystemDiagnostics>('/control-plane/diagnostics');
  return response.data;
};

export const getRbacMatrix = async (): Promise<RbacMatrixRow[]> => {
  const response = await apiClient.get<RbacMatrixRow[]>('/control-plane/rbac-matrix');
  return response.data;
};

export const evaluateAccessDecision = async (
  permission: string,
  resource = 'ControlPlane',
  user = 'admin@irisyn.io',
  role = 'ADMIN'
): Promise<AccessDecision> => {
  const response = await apiClient.post<AccessDecision>('/control-plane/evaluate-access', null, {
    params: { user, role, permission, resource },
  });
  return response.data;
};
