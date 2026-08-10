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

export type AssetSource = 'REAL-TIME LOCAL' | 'SIMULATED' | 'TARGET / FUTURE';
export type AssetType = 'LAPTOP' | 'SERVER' | 'INDUSTRIAL_MOTOR' | 'PUMP' | 'CNC_MACHINE' | 'COMPRESSOR' | 'ROBOT';

export interface TelemetryMetrics {
  cpu: number;
  cpuFreqGHz: number;
  ram: number;
  ramUsedGb: number;
  ramTotalGb: number;
  disk: number;
  diskUsedGb: number;
  diskTotalGb: number;
  temperature: number;
  networkInKbps: number;
  networkOutKbps: number;
  processCount: number;
  threadCount: number;
  uptimeSeconds: number;
  loadAverage: number;
  rpm?: number;
}

export interface DataQuality {
  valid: boolean;
  freshnessMs: number;
  completenessPct: number;
  latencyMs: number;
  status: 'GOOD' | 'STALE' | 'DEGRADED' | 'BUFFERED';
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  source: AssetSource;
  manufacturer: string;
  model: string;
  location: string;
  status: ServerStatus;
  operatingMode: 'NORMAL' | 'HIGH_LOAD' | 'DEGRADATION' | 'FAULT' | 'DISCONNECTED';
  healthScore: number;
  healthBreakdown: Record<string, number>;
  operatingHours: number;
  metrics: TelemetryMetrics;
  quality: DataQuality;
  lastUpdated: string;
  activeAlerts?: string[];
  currentPrediction?: string;
  recommendedAction?: string;
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

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER' | 'ANALYST';
  createdAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

export interface AutomationLog {
  id: string;
  actionName: string;
  targetId: string;
  executedBy: string;
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
  timestamp: string;
  details?: string;
}

export interface ServiceDirectoryItem {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  version: string;
  latencyMs?: number;
}

export interface ServiceLineage {
  sourceService: string;
  targetService: string;
  relationship: string;
  protocol: string;
}

