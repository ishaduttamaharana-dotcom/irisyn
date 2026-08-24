import {
  Alert,
  Asset,
  AutomationLog,
  ClusterSummary,
  Container,
  MetricPoint,
  Server,
  ServiceDirectoryItem,
  ServiceLineage,
  User,
  VirtualMachine,
} from '@/types/domain';
import {
  SystemConfigOverview,
  SystemDiagnostics,
  RbacMatrixRow,
} from './controlPlane.service';

const RACKS = ['Rack A', 'Rack B'];
const STATUSES: Server['status'][] = ['HEALTHY', 'HEALTHY', 'HEALTHY', 'WARNING', 'CRITICAL'];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.round(min + Math.random() * (max - min));

export const mockServers: Server[] = Array.from({ length: 12 }, (_, i) => ({
  id: `srv-${i + 1}`,
  hostname: `dc-node-${(i + 1).toString().padStart(2, '0')}`,
  rack: pick(RACKS),
  status: pick(STATUSES),
  cpuUsage: rand(20, 95),
  ramUsage: rand(30, 90),
  diskUsage: rand(10, 85),
  temperatureC: rand(35, 72),
  uptimeHours: rand(10, 4000),
}));

export const mockMetrics: MetricPoint[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: `${i}:00`,
  cpu: rand(30, 90),
  ram: rand(40, 85),
  disk: rand(20, 70),
  network: rand(10, 100),
}));

export const mockAlerts: Alert[] = [
  { id: 'al-1', severity: 'CRITICAL', message: 'Node dc-node-04 CPU sustained above 95%', source: 'dc-node-04', createdAt: new Date().toISOString(), acknowledged: false },
  { id: 'al-2', severity: 'WARNING', message: 'Rack B ambient temperature rising (38.5°C)', source: 'Rack B', createdAt: new Date().toISOString(), acknowledged: false },
  { id: 'al-3', severity: 'INFO', message: 'Automation job "nightly-backup" completed successfully', source: 'automation', createdAt: new Date().toISOString(), acknowledged: true },
  { id: 'al-4', severity: 'CRITICAL', message: 'Stator temperature warning on MOTOR-001 (68.5°C)', source: 'MOTOR-001', createdAt: new Date().toISOString(), acknowledged: false },
];

export const mockCluster: ClusterSummary = {
  totalNodes: mockServers.length,
  healthyNodes: mockServers.filter((s) => s.status === 'HEALTHY').length,
  degradedNodes: mockServers.filter((s) => s.status === 'WARNING').length,
  offlineNodes: mockServers.filter((s) => s.status === 'OFFLINE').length,
  cpuAverage: Math.round(mockServers.reduce((a, s) => a + s.cpuUsage, 0) / mockServers.length),
  ramAverage: Math.round(mockServers.reduce((a, s) => a + s.ramUsage, 0) / mockServers.length),
  podsCount: 48,
  deploymentsCount: 16,
  namespacesCount: 6,
  servicesCount: 22,
  storageUsage: 64,
  overallHealth: 'HEALTHY',
};

export const mockVms: VirtualMachine[] = Array.from({ length: 8 }, (_, i) => ({
  id: `vm-${i + 1}`,
  name: `vm-workload-${i + 1}`,
  hostServerId: `srv-${(i % mockServers.length) + 1}`,
  status: pick(STATUSES),
  vcpu: pick([2, 4, 8]),
  ramGb: pick([4, 8, 16]),
}));

export const mockContainers: Container[] = Array.from({ length: 10 }, (_, i) => ({
  id: `ctr-${i + 1}`,
  name: `service-${i + 1}`,
  image: `registry.internal/svc:${rand(1, 9)}.${rand(0, 9)}.${rand(0, 9)}`,
  podName: `pod-${i + 1}`,
  status: pick(['RUNNING', 'RUNNING', 'RUNNING', 'PENDING', 'CRASHLOOP'] as Container['status'][]),
  cpuUsage: rand(5, 80),
  ramUsage: rand(10, 80),
}));

export const mockAssets: Asset[] = [
  {
    id: 'MOTOR-001',
    name: '3-Phase Induction Motor (150kW)',
    type: 'INDUSTRIAL_MOTOR',
    source: 'SIMULATED',
    manufacturer: 'Siemens Industrial',
    model: '1LA9-150KW-4P',
    location: 'Plant A - Line 1',
    status: 'WARNING',
    operatingMode: 'HIGH_LOAD',
    healthScore: 72,
    healthBreakdown: { thermal: 65, vibration: 70, electrical: 85, acoustic: 75 },
    operatingHours: 4230,
    metrics: {
      cpu: 75,
      cpuFreqGHz: 3.2,
      ram: 60,
      ramUsedGb: 9.6,
      ramTotalGb: 16,
      disk: 45,
      diskUsedGb: 225,
      diskTotalGb: 500,
      temperature: 68,
      networkInKbps: 4500,
      networkOutKbps: 8200,
      processCount: 142,
      threadCount: 680,
      uptimeSeconds: 360000,
      loadAverage: 2.4,
      rpm: 1780,
    },
    quality: { valid: true, freshnessMs: 120, completenessPct: 100, latencyMs: 15, status: 'GOOD' },
    lastUpdated: new Date().toISOString(),
    activeAlerts: ['Stator winding temp elevated', 'Bearing vibration spike'],
    currentPrediction: 'Bearing wear detected (72% failure risk within 48h)',
    recommendedAction: 'Schedule bearing lubrication during next shift change',
  },
  {
    id: 'LAPTOP-001',
    name: 'Host Workstation System',
    type: 'LAPTOP',
    source: 'REAL-TIME LOCAL',
    manufacturer: 'Host Hardware',
    model: 'Core i7 Workstation',
    location: 'Local Host Environment',
    status: 'HEALTHY',
    operatingMode: 'NORMAL',
    healthScore: 96,
    healthBreakdown: { thermal: 95, vibration: 100, electrical: 98, acoustic: 95 },
    operatingHours: 1240,
    metrics: {
      cpu: 28,
      cpuFreqGHz: 2.8,
      ram: 48,
      ramUsedGb: 15.3,
      ramTotalGb: 32,
      disk: 35,
      diskUsedGb: 350,
      diskTotalGb: 1000,
      temperature: 44,
      networkInKbps: 1200,
      networkOutKbps: 3400,
      processCount: 210,
      threadCount: 1100,
      uptimeSeconds: 86400,
      loadAverage: 1.1,
    },
    quality: { valid: true, freshnessMs: 45, completenessPct: 100, latencyMs: 5, status: 'GOOD' },
    lastUpdated: new Date().toISOString(),
    activeAlerts: [],
    currentPrediction: 'Nominal operational status across all hardware sensors',
    recommendedAction: 'No immediate action required',
  },
  {
    id: 'PUMP-001',
    name: 'Centrifugal Fluid Pump',
    type: 'PUMP',
    source: 'SIMULATED',
    manufacturer: 'Grundfos Systems',
    model: 'CRN-95-2',
    location: 'Plant A - Cooling Loop',
    status: 'HEALTHY',
    operatingMode: 'NORMAL',
    healthScore: 92,
    healthBreakdown: { thermal: 90, vibration: 94, electrical: 92, acoustic: 90 },
    operatingHours: 8520,
    metrics: {
      cpu: 32,
      cpuFreqGHz: 2.4,
      ram: 40,
      ramUsedGb: 3.2,
      ramTotalGb: 8,
      disk: 20,
      diskUsedGb: 50,
      diskTotalGb: 256,
      temperature: 38,
      networkInKbps: 800,
      networkOutKbps: 1200,
      processCount: 88,
      threadCount: 340,
      uptimeSeconds: 600000,
      loadAverage: 0.8,
      rpm: 2900,
    },
    quality: { valid: true, freshnessMs: 80, completenessPct: 100, latencyMs: 10, status: 'GOOD' },
    lastUpdated: new Date().toISOString(),
    activeAlerts: [],
    currentPrediction: 'Impeller wear within normal tolerance threshold',
    recommendedAction: 'Continue standard monthly maintenance schedule',
  },
  {
    id: 'CNC-001',
    name: '5-Axis CNC Milling Station',
    type: 'CNC_MACHINE',
    source: 'TARGET / FUTURE',
    manufacturer: 'DMG Mori',
    model: 'DMU 50 3rd Gen',
    location: 'Factory Floor - Line 2',
    status: 'OFFLINE',
    operatingMode: 'DISCONNECTED',
    healthScore: 50,
    healthBreakdown: { thermal: 50, vibration: 50, electrical: 50, acoustic: 50 },
    operatingHours: 3100,
    metrics: {
      cpu: 0,
      cpuFreqGHz: 0,
      ram: 0,
      ramUsedGb: 0,
      ramTotalGb: 16,
      disk: 0,
      diskUsedGb: 0,
      diskTotalGb: 512,
      temperature: 20,
      networkInKbps: 0,
      networkOutKbps: 0,
      processCount: 0,
      threadCount: 0,
      uptimeSeconds: 0,
      loadAverage: 0,
      rpm: 0,
    },
    quality: { valid: false, freshnessMs: 99999, completenessPct: 0, latencyMs: 0, status: 'STALE' },
    lastUpdated: new Date().toISOString(),
    activeAlerts: ['Asset disconnected from telemetry bus'],
    currentPrediction: 'Telemetry link inactive',
    recommendedAction: 'Verify physical Ethernet gateway connection',
  },
];

export const mockAutomationLogs: AutomationLog[] = [
  {
    id: 'log-101',
    actionName: 'LIVE_MIGRATION',
    targetId: 'vm-workload-3',
    executedBy: 'IRISYN Autonomous Remediation',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: 'Migrated guest workload from dc-node-04 to dc-node-01 (CPU high)',
  },
  {
    id: 'log-102',
    actionName: 'SCALE_PODS',
    targetId: 'service-telemetry',
    executedBy: 'OpenShift HPA',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    details: 'Scaled pods from 2 to 4 replicas due to ingestion queue load',
  },
  {
    id: 'log-103',
    actionName: 'THERMAL_THROTTLE',
    targetId: 'MOTOR-001',
    executedBy: 'Industrial Control Agent',
    status: 'SUCCESS',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    details: 'Reduced motor speed multiplier to 1x to cool stator windings',
  },
];

export const mockServiceDirectory: ServiceDirectoryItem[] = [
  { id: 'svc-1', name: 'Telemetry Collector', type: 'Ingestion', endpoint: '/api/metrics', status: 'UP', version: '2.1.0', latencyMs: 8 },
  { id: 'svc-2', name: 'Digital Twin State Engine', type: 'State', endpoint: '/api/assets', status: 'UP', version: '3.0.4', latencyMs: 12 },
  { id: 'svc-3', name: 'OpenShift AI Inference Blueprint', type: 'Analytics', endpoint: '/api/predict', status: 'UP', version: '1.4.0', latencyMs: 25 },
  { id: 'svc-4', name: 'Autonomous Remediation Service', type: 'Automation', endpoint: '/api/recover', status: 'UP', version: '2.0.1', latencyMs: 15 },
  { id: 'svc-5', name: 'IRISYN AI Copilot RAG Agent', type: 'Copilot', endpoint: '/api/copilot', status: 'UP', version: '3.1.0', latencyMs: 18 },
];

export const mockServiceLineage: ServiceLineage[] = [
  { sourceService: 'Hardware Telemetry Collector', targetService: 'Digital Twin State Engine', relationship: 'Data Stream', protocol: 'WebSocket' },
  { sourceService: 'Digital Twin State Engine', targetService: 'OpenShift AI Inference', relationship: 'Inference Target', protocol: 'gRPC / REST' },
  { sourceService: 'OpenShift AI Inference', targetService: 'Autonomous Remediation Service', relationship: 'Trigger Event', protocol: 'Kafka AMQ' },
  { sourceService: 'Digital Twin State Engine', targetService: 'IRISYN React Dashboard', relationship: 'UI State', protocol: 'HTTP REST' },
];

export const mockRbacMatrix: RbacMatrixRow[] = [
  { permission: 'view_telemetry', ADMIN: true, ENGINEER: true, OPERATOR: true, VIEWER: true },
  { permission: 'trigger_inference', ADMIN: true, ENGINEER: true, OPERATOR: true, VIEWER: false },
  { permission: 'execute_remediation', ADMIN: true, ENGINEER: true, OPERATOR: false, VIEWER: false },
  { permission: 'modify_health_weights', ADMIN: true, ENGINEER: false, OPERATOR: false, VIEWER: false },
  { permission: 'manage_system_config', ADMIN: true, ENGINEER: false, OPERATOR: false, VIEWER: false },
];

export const mockSystemConfig: SystemConfigOverview = {
  platformName: 'IRISYN Industrial Digital Twin Platform',
  tagline: 'Digital Twin Platform',
  environment: 'Local Workstation & Cloud Twin Hybrid',
  defaultMode: 'SIMULATED + LOCAL HARDWARE',
  timezone: 'UTC+05:30',
  collectionIntervalSec: 1,
  telemetryTransport: 'WebSockets + HTTP REST',
  staleThresholdSec: 5,
  healthWeights: {
    thermal: 0.35,
    vibration: 0.25,
    electrical: 0.25,
    acoustic: 0.15,
  },
  alertThresholds: {
    cpuWarningPct: 80,
    cpuCriticalPct: 95,
    tempWarningC: 60,
    tempCriticalC: 75,
  },
  featureFlags: {
    enableOpenShiftVirtualization: true,
    enableCopilotRAG: true,
    enableAutomatedRemediation: true,
    enableHardwareSensors: true,
  },
};

export const mockDiagnostics: SystemDiagnostics = {
  overallStatus: 'HEALTHY',
  totalDiagnosticsDurationMs: 142,
  timestamp: new Date().toISOString(),
  components: [
    { name: 'Host OS Telemetry Collector', status: 'ONLINE', latencyMs: 4, source: 'REAL-TIME LOCAL', details: 'Collecting system sensors at 1Hz' },
    { name: 'Quarkus Digital Twin Engine', status: 'HEALTHY', latencyMs: 12, source: 'CORE PLATFORM', details: 'Memory state model active' },
    { name: 'PostgreSQL / H2 Database', status: 'CONNECTED', latencyMs: 8, source: 'STORAGE', details: 'Flyway migrations up to date' },
    { name: 'OpenShift AI Inference Service', status: 'RUNNING', latencyMs: 22, source: 'ANALYTICS', details: 'Blueprints loaded' },
    { name: 'OpenShift Virtualization API', status: 'CONNECTED', latencyMs: 18, source: 'INFRASTRUCTURE', details: 'Live migration ready' },
  ],
};

export const mockUsers: User[] = [
  { id: 'usr-1', username: 'admin@irisyn.io', email: 'admin@irisyn.io', role: 'ADMIN' },
  { id: 'usr-2', username: 'operator@irisyn.io', email: 'operator@irisyn.io', role: 'OPERATOR' },
  { id: 'usr-3', username: 'analyst@irisyn.io', email: 'analyst@irisyn.io', role: 'ANALYST' },
];
