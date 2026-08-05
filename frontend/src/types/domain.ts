export type ServerStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

export interface Server {
  id: string;
  hostname: string;
  rack: string;
  status: ServerStatus;
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  temperatureC: number;
  uptimeHours: number;
}

export interface MetricPoint {
  timestamp: string;
  cpu: number;
  ram: number;
  disk: number;
  network: number;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  source: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface ClusterSummary {
  totalNodes: number;
  healthyNodes: number;
  degradedNodes: number;
  offlineNodes: number;
  cpuAverage: number;
  ramAverage: number;
  podsCount?: number;
  deploymentsCount?: number;
  namespacesCount?: number;
  servicesCount?: number;
  storageUsage?: number;
  overallHealth?: string;
}

export interface VirtualMachine {
  id: string;
  name: string;
  hostServerId: string;
  status: ServerStatus;
  vcpu: number;
  ramGb: number;
}

export interface Container {
  id: string;
  name: string;
  image: string;
  podName: string;
  status: 'RUNNING' | 'PENDING' | 'CRASHLOOP' | 'STOPPED';
  cpuUsage: number;
  ramUsage: number;
}

export interface PredictionRequest {
  targetId: string;
  horizonMinutes: number;
}

export interface PredictionResponse {
  targetId: string;
  predictedFailureProbability: number;
  recommendedAction: string;
}

export interface RecoveryRequest {
  targetId: string;
  action: 'RESTART' | 'MIGRATE' | 'SCALE' | 'ISOLATE';
}

export interface RecoveryResponse {
  targetId: string;
  status: 'ACCEPTED' | 'REJECTED';
  message: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  sessionId: string;
  reply: string;
}
