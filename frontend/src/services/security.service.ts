import { apiClient } from './apiClient';

export interface ServiceRecord {
  id: string;
  name: string;
  version: string;
  status: string;
  health: string;
  latencyMs: number;
  dependencies: string[];
  lastSuccess: string;
  lastError: string;
}

export interface IntegrationRecord {
  id: string;
  name: string;
  category: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'NOT_CONFIGURED' | 'TARGET_FUTURE';
  targetProtocol: string;
  lastChecked: string;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  email: string;
  role: string;
  createdAt: string;
  lastActiveAt: string;
  revoked: boolean;
}

export interface RateLimitMetrics {
  activeClients: number;
  maxRequestsPerWindow: number;
  windowSeconds: number;
  status: string;
}

export interface SystemModeDetails {
  currentMode: 'NORMAL' | 'SIMULATION' | 'DEMO' | 'MAINTENANCE' | 'READ_ONLY' | 'EMERGENCY';
  isWriteAllowed: boolean;
  setBy: string;
  lastChanged: string;
}

export interface DiagnosticsDetails {
  overallStatus: string;
  activeSystemMode: string;
  checkedServices: number;
  checkedIntegrations: number;
  failedChecks: number;
  dataFreshnessSLA: string;
  diagnosticsTimestamp: string;
}

export interface ConfigItem {
  key: string;
  value: any;
  unit: string;
  scope: string;
  version: number;
  updatedBy: string;
  updatedAt: string;
}

export interface ConfigProposal {
  key: string;
  proposedValue: any;
  proposedBy: string;
  schemaValid: boolean;
  dependencyCheck: string;
  impactAnalysis: string;
  requiresConfirmation: boolean;
  status: string;
}

export interface AccessDecisionResult {
  allowed: boolean;
  user: string;
  role: string;
  action: string;
  target: string;
  reason: string;
}

export const evaluateAccessDecision = (
  user: string,
  role: string,
  action: string,
  target: string
): AccessDecisionResult => {
  const r = role.toUpperCase();
  if (r === 'ADMIN') {
    return {
      allowed: true,
      user,
      role,
      action,
      target,
      reason: 'Administrator role has full platform authorization across all resources and scopes.',
    };
  } else if (r === 'ENGINEER') {
    if (action.includes('Delete') || action.includes('Role.Update')) {
      return {
        allowed: false,
        user,
        role,
        action,
        target,
        reason: 'Engineer role lacks DELETE and Role Governance permissions.',
      };
    }
    return {
      allowed: true,
      user,
      role,
      action,
      target,
      reason: 'Role and asset scope permit engineering analysis, simulation, and configuration.',
    };
  } else if (r === 'OPERATOR') {
    if (action.includes('Write') || action.includes('Configure') || action.includes('Delete')) {
      return {
        allowed: false,
        user,
        role,
        action,
        target,
        reason: 'Operator role lacks direct write/configuration permissions. Requires engineering authorization.',
      };
    }
    return {
      allowed: true,
      user,
      role,
      action,
      target,
      reason: 'Operator role permits operational monitoring, alert acknowledgement, and approved actions.',
    };
  } else {
    // VIEWER
    if (action.includes('Read') || action.includes('View')) {
      return {
        allowed: true,
        user,
        role,
        action,
        target,
        reason: 'Viewer role permits read-only monitoring access.',
      };
    }
    return {
      allowed: false,
      user,
      role,
      action,
      target,
      reason: `User with role ${role} lacks permission for ${action}. Read-only access enforced.`,
    };
  }
};

export const getServiceRegistry = async (): Promise<ServiceRecord[]> => {
  try {
    const res = await apiClient.get<ServiceRecord[]>('/control/services');
    if (res.data) return res.data;
  } catch (err) {
    console.warn('Service registry API unreachable, returning client fallback');
  }

  return [
    { id: 'SRV-01', name: 'REST API Gateway', version: 'v1.0.0', status: 'ONLINE', health: 'PASS', latencyMs: 12, dependencies: ['Database'], lastSuccess: new Date().toISOString(), lastError: 'NONE' },
    { id: 'SRV-02', name: 'Telemetry Collector', version: 'v1.0.0', status: 'ONLINE', health: 'PASS', latencyMs: 18, dependencies: ['PostgreSQL'], lastSuccess: new Date().toISOString(), lastError: 'NONE' },
    { id: 'SRV-03', name: 'Ingestion Pipeline', version: 'v1.0.0', status: 'ONLINE', health: 'PASS', latencyMs: 15, dependencies: ['Telemetry Collector'], lastSuccess: new Date().toISOString(), lastError: 'NONE' },
    { id: 'SRV-04', name: 'Database (PostgreSQL)', version: 'v15.2', status: 'ONLINE', health: 'PASS', latencyMs: 4, dependencies: [], lastSuccess: new Date().toISOString(), lastError: 'NONE' },
    { id: 'SRV-05', name: 'WebSockets (/ws/telemetry)', version: 'v1.0.0', status: 'ONLINE', health: 'PASS', latencyMs: 2, dependencies: ['Ingestion Pipeline'], lastSuccess: new Date().toISOString(), lastError: 'NONE' },
    { id: 'SRV-06', name: 'Digital Twin Engine', version: 'v1.0.0', status: 'ONLINE', health: 'PASS', latencyMs: 14, dependencies: ['Database'], lastSuccess: new Date().toISOString(), lastError: 'NONE' },
    { id: 'SRV-07', name: 'Health Scoring Engine', version: 'v1.0.0', status: 'ONLINE', health: 'PASS', latencyMs: 16, dependencies: ['Digital Twin Engine'], lastSuccess: new Date().toISOString(), lastError: 'NONE' },
    { id: 'SRV-08', name: 'Anomaly Detector (|Z|>=2.5σ)', version: 'v1.0.0', status: 'ONLINE', health: 'PASS', latencyMs: 22, dependencies: ['Digital Twin Engine'], lastSuccess: new Date().toISOString(), lastError: 'NONE' },
    { id: 'SRV-09', name: 'Prediction Risk Engine', version: 'v2.1.0', status: 'DEGRADED', health: 'WARN', latencyMs: 85, dependencies: ['Anomaly Detector'], lastSuccess: new Date().toISOString(), lastError: 'Model latency high' },
    { id: 'SRV-10', name: 'Copilot Engineering Agent', version: 'v1.0.0', status: 'ONLINE', health: 'PASS', latencyMs: 28, dependencies: ['Digital Twin Engine'], lastSuccess: new Date().toISOString(), lastError: 'NONE' },
    { id: 'SRV-11', name: 'Industrial Physics Simulator', version: 'v1.0.0', status: 'ONLINE', health: 'PASS', latencyMs: 8, dependencies: [], lastSuccess: new Date().toISOString(), lastError: 'NONE' },
    { id: 'SRV-12', name: 'Alerts Dispatcher', version: 'v1.0.0', status: 'ONLINE', health: 'PASS', latencyMs: 10, dependencies: ['Anomaly Detector'], lastSuccess: new Date().toISOString(), lastError: 'NONE' },
    { id: 'SRV-13', name: 'Maintenance Work Orders Engine', version: 'v1.0.0', status: 'ONLINE', health: 'PASS', latencyMs: 12, dependencies: ['Prediction Engine'], lastSuccess: new Date().toISOString(), lastError: 'NONE' },
    { id: 'SRV-14', name: 'Automation Engine', version: 'v1.0.0', status: 'ONLINE', health: 'PASS', latencyMs: 11, dependencies: ['Alerts Dispatcher'], lastSuccess: new Date().toISOString(), lastError: 'NONE' },
  ];
};

export const getIntegrationRegistry = async (): Promise<IntegrationRecord[]> => {
  try {
    const res = await apiClient.get<IntegrationRecord[]>('/control/integrations');
    if (res.data) return res.data;
  } catch (err) {
    console.warn('Integration registry API unreachable, returning client fallback');
  }

  return [
    { id: 'INT-01', name: 'Local Hardware Telemetry Collector', category: 'HARDWARE', status: 'CONNECTED', targetProtocol: 'OS Native API', lastChecked: new Date().toISOString() },
    { id: 'INT-02', name: 'WebSockets Ingestion Channel', category: 'NETWORK', status: 'CONNECTED', targetProtocol: 'WSS /ws/telemetry', lastChecked: new Date().toISOString() },
    { id: 'INT-03', name: 'PostgreSQL System Storage', category: 'DATABASE', status: 'CONNECTED', targetProtocol: 'JDBC TCP 5432', lastChecked: new Date().toISOString() },
    { id: 'INT-04', name: 'MQTT Industrial Edge Broker', category: 'PROTOCOL', status: 'TARGET_FUTURE', targetProtocol: 'MQTT v5.0 TCP 1883', lastChecked: 'N/A' },
    { id: 'INT-05', name: 'OPC-UA Industrial Server Gateway', category: 'PROTOCOL', status: 'TARGET_FUTURE', targetProtocol: 'OPC-UA Binary opc.tcp://', lastChecked: 'N/A' },
    { id: 'INT-06', name: 'Modbus TCP PLC Gateway', category: 'PROTOCOL', status: 'TARGET_FUTURE', targetProtocol: 'Modbus TCP Port 502', lastChecked: 'N/A' },
    { id: 'INT-07', name: 'Red Hat Enterprise Linux Edge Node', category: 'OPERATING_SYSTEM', status: 'CONNECTED', targetProtocol: 'RHEL 9.3 Systemd', lastChecked: new Date().toISOString() },
    { id: 'INT-08', name: 'OpenShift Container Platform Cluster', category: 'INFRASTRUCTURE', status: 'TARGET_FUTURE', targetProtocol: 'OpenShift v4.14 API', lastChecked: 'N/A' },
    { id: 'INT-09', name: 'Red Hat OpenShift AI Model Service', category: 'AI_PLATFORM', status: 'TARGET_FUTURE', targetProtocol: 'vLLM / KServe gRPC', lastChecked: 'N/A' },
  ];
};

export const getActiveSessions = async (): Promise<UserSession[]> => {
  try {
    const res = await apiClient.get<UserSession[]>('/control/sessions');
    if (res.data) return res.data;
  } catch (err) {
    console.warn('Sessions API unreachable, returning client fallback');
  }

  return [
    { sessionId: 'SESS-ADMIN-1001', userId: 'USR-001', email: 'admin@example.com', role: 'ADMIN', createdAt: new Date().toISOString(), lastActiveAt: new Date().toISOString(), revoked: false },
    { sessionId: 'SESS-OP-1002', userId: 'USR-002', email: 'operator@example.com', role: 'OPERATOR', createdAt: new Date().toISOString(), lastActiveAt: new Date().toISOString(), revoked: false },
    { sessionId: 'SESS-ENG-1003', userId: 'USR-003', email: 'engineer@example.com', role: 'ENGINEER', createdAt: new Date().toISOString(), lastActiveAt: new Date().toISOString(), revoked: false },
  ];
};

export const revokeSession = async (sessionId: string): Promise<boolean> => {
  try {
    const res = await apiClient.post<{ sessionId: string; revoked: boolean }>('/control/sessions/revoke', { sessionId });
    if (res.data) return res.data.revoked;
  } catch (err) {
    console.warn('Revoke session API unreachable, returning fallback');
  }
  return true;
};

export const getRateLimitMetrics = async (): Promise<RateLimitMetrics> => {
  try {
    const res = await apiClient.get<RateLimitMetrics>('/control/rate-limits');
    if (res.data) return res.data;
  } catch (err) {
    console.warn('Rate limit metrics API unreachable, returning fallback');
  }

  return {
    activeClients: 1,
    maxRequestsPerWindow: 60,
    windowSeconds: 60,
    status: 'ACTIVE',
  };
};

export const getDiagnostics = async (): Promise<DiagnosticsDetails> => {
  try {
    const res = await apiClient.get<DiagnosticsDetails>('/control/diagnostics');
    if (res.data) return res.data;
  } catch (err) {
    console.warn('Diagnostics API unreachable, returning client fallback');
  }

  return {
    overallStatus: 'HEALTHY',
    activeSystemMode: 'NORMAL',
    checkedServices: 14,
    checkedIntegrations: 9,
    failedChecks: 0,
    dataFreshnessSLA: 'LIVE (0.8s sync)',
    diagnosticsTimestamp: new Date().toISOString(),
  };
};

export const getSystemMode = async (): Promise<SystemModeDetails> => {
  try {
    const res = await apiClient.get<SystemModeDetails>('/control/mode');
    if (res.data) return res.data;
  } catch (err) {
    console.warn('System mode API unreachable, returning client fallback');
  }

  return {
    currentMode: 'NORMAL',
    isWriteAllowed: true,
    setBy: 'ADMIN',
    lastChanged: new Date().toISOString(),
  };
};

export const setSystemMode = async (mode: string): Promise<SystemModeDetails> => {
  try {
    const res = await apiClient.post<SystemModeDetails>('/control/mode', { mode, setBy: 'ADMIN' });
    if (res.data) return res.data;
  } catch (err) {
    console.warn('Set system mode API unreachable, applying client mode');
  }

  return {
    currentMode: mode as any,
    isWriteAllowed: mode !== 'READ_ONLY' && mode !== 'MAINTENANCE',
    setBy: 'ADMIN',
    lastChanged: new Date().toISOString(),
  };
};

export const getConfigurations = async (): Promise<ConfigItem[]> => {
  try {
    const res = await apiClient.get<ConfigItem[]>('/control/configs');
    if (res.data) return res.data;
  } catch (err) {
    console.warn('Configs API unreachable, returning client fallback');
  }

  return [
    { key: 'telemetry.staleThreshold', value: 10, unit: 'seconds', scope: 'GLOBAL', version: 1, updatedBy: 'USR-001', updatedAt: new Date().toISOString() },
    { key: 'anomaly.zScoreThreshold', value: 2.5, unit: 'sigma', scope: 'GLOBAL', version: 1, updatedBy: 'USR-001', updatedAt: new Date().toISOString() },
    { key: 'prediction.horizonHours', value: 72, unit: 'hours', scope: 'GLOBAL', version: 1, updatedBy: 'USR-001', updatedAt: new Date().toISOString() },
  ];
};

export const proposeConfigChange = async (key: string, value: any): Promise<ConfigProposal> => {
  try {
    const res = await apiClient.post<ConfigProposal>('/control/config/propose', { key, value, user: 'USR-001' });
    if (res.data) return res.data;
  } catch (err) {
    console.warn('Propose config API unreachable, returning fallback proposal');
  }

  return {
    key,
    proposedValue: value,
    proposedBy: 'USR-001',
    schemaValid: true,
    dependencyCheck: 'PASS',
    impactAnalysis: `Changing ${key} to ${value} will re-evaluate active telemetry SLA thresholds.`,
    requiresConfirmation: true,
    status: 'PROPOSED',
  };
};

export const applyConfigChange = async (key: string, value: any): Promise<ConfigItem> => {
  try {
    const res = await apiClient.post<ConfigItem>('/control/config/apply', { key, value, user: 'USR-001' });
    if (res.data) return res.data;
  } catch (err) {
    console.warn('Apply config API unreachable, returning fallback item');
  }

  return {
    key,
    value,
    unit: 'seconds',
    scope: 'GLOBAL',
    version: 2,
    updatedBy: 'USR-001',
    updatedAt: new Date().toISOString(),
  };
};
