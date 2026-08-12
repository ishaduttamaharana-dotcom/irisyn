export type InferenceType = 'OBSERVED' | 'INFERRED' | 'PREDICTED';

export interface OperationalDataTrace {
  source: AssetSource;
  assetId: string;
  metric: string;
  period: string;
  freshnessMs: number;
  dataQuality: 'GOOD' | 'STALE' | 'DEGRADED' | 'BUFFERED';
  inferenceType: InferenceType;
}

export interface ApiMeta {
  timestamp: string;
  source: AssetSource;
  version: string;
  latencyMs?: number;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}

export type UserRole = 'ADMIN' | 'ENGINEER' | 'OPERATOR' | 'VIEWER' | 'ANALYST';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  lastLogin?: string;
}

export type AssetSource = 'REAL-TIME LOCAL' | 'SIMULATED' | 'TARGET / FUTURE';

export type AssetType = 
  | 'LAPTOP' 
  | 'SERVER' 
  | 'INDUSTRIAL_MOTOR' 
  | 'PUMP' 
  | 'CNC_MACHINE' 
  | 'COMPRESSOR' 
  | 'ROBOT'
  | 'EDGE_GATEWAY';

export type ServerStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
export type AssetOperatingMode = 'NORMAL' | 'HIGH_LOAD' | 'DEGRADATION' | 'FAULT' | 'DISCONNECTED';

export interface Sensor {
  id: string;
  assetId: string;
  name: string;
  type: string;
  unit: string;
  minValue: number;
  maxValue: number;
  currentValue: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

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
  torqueNm?: number;
  vibrationMmS?: number;
  powerKw?: number;
}

export interface DataQuality {
  valid: boolean;
  freshnessMs: number;
  completenessPct: number;
  latencyMs: number;
  status: 'GOOD' | 'STALE' | 'DEGRADED' | 'BUFFERED';
}

export interface AssetHealth {
  score: number; // 0 - 100
  status: ServerStatus;
  breakdown: Record<string, number>;
  factors: Array<{ factor: string; impact: number; description: string }>;
  lastEvaluated: string;
}

export interface Anomaly {
  id: string;
  assetId: string;
  metricName: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedValue: number;
  expectedValue: number;
  deviationSigma: number;
  detectedAt: string;
  description: string;
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
  operatingMode: AssetOperatingMode;
  healthScore: number;
  healthBreakdown: Record<string, number>;
  operatingHours: number;
  metrics: TelemetryMetrics;
  sensors?: Sensor[];
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
  temperature?: number;
  rpm?: number;
  vibration?: number;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  source: string;
  assetId?: string;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

export interface Incident {
  id: string;
  title: string;
  assetId: string;
  severity: AlertSeverity;
  status: 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
  summary: string;
}

export interface MaintenanceWorkOrder {
  id: string;
  assetId: string;
  assetName: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description: string;
  dueDate: string;
  assignedEngineer?: string;
  estimatedHours: number;
}

export interface Prediction {
  id: string;
  targetId: string;
  assetName: string;
  failureProbability: number; // 0 - 1
  predictedFailureTime: string;
  horizonMinutes: number;
  confidenceScore: number;
  rootCauseFactor: string;
  recommendedAction: string;
}

export interface SimulationState {
  id: string;
  assetId: string;
  status: 'RUNNING' | 'PAUSED' | 'FAULT_INJECTED' | 'STOPPED';
  speedRpm: number;
  loadPct: number;
  temperatureC: number;
  vibrationLevel: number;
  simulatedFault?: string;
  updatedAt: string;
}

export interface PlatformConfig {
  key: string;
  value: string;
  category: string;
  description: string;
  isSecret: boolean;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  userRole: UserRole;
  action: string;
  resource: string;
  ipAddress: string;
  details: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'DENIED';
}

export interface SystemInfo {
  serviceStatus: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  apiStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  databaseStatus: 'CONNECTED' | 'DISCONNECTED';
  dataSourcesStatus: {
    realTimeLocal: 'ACTIVE' | 'INACTIVE';
    simulated: 'ACTIVE' | 'INACTIVE';
    targetFuture: 'PLANNED' | 'DISABLED';
  };
  telemetryFreshnessMs: number;
  environment: string;
  version: string;
  activeAssetsCount: number;
  activeAlertsCount: number;
  openIncidentsCount: number;
}

export interface IntegrationItem {
  id: string;
  name: string;
  protocol: 'REST' | 'MQTT' | 'OPC-UA' | 'MODBUS' | 'PLC' | 'REDHAT_EDGE';
  sourceCategory: AssetSource;
  status: 'CONNECTED' | 'STANDBY' | 'TARGET_FUTURE' | 'ERROR';
  endpoint: string;
  latencyMs?: number;
  description: string;
}

export interface DiagnosticItem {
  id: string;
  component: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  lastRun: string;
  message: string;
  latencyMs: number;
}

export interface ReportItem {
  id: string;
  title: string;
  category: 'OPERATIONAL' | 'HEALTH' | 'MAINTENANCE' | 'SECURITY' | 'TELEMETRY';
  generatedAt: string;
  generatedBy: string;
  format: 'PDF' | 'CSV' | 'JSON';
  downloadUrl: string;
}

// Data Center Server / Infrastructure legacy compatibility definitions
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
