export type InfrastructureStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE' | 'RUNNING' | 'FAILED' | 'PENDING';
export type SourceType = 'REAL-TIME LOCAL' | 'SIMULATED' | 'TARGET / FUTURE';

export interface ServerNode {
  id: string;
  hostname: string;
  rack: 'Rack A' | 'Rack B' | 'Rack C';
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  temperatureC: number;
  networkMbps: number;
  uptimeHours: number;
  vmsCount: number;
  podsCount: number;
  lastUpdateSecAgo: number;
  source: SourceType;
  hostedVms: string[];
  hostedPods: string[];
  activeAlertsCount: number;
  problem?: string;
  impact?: string;
  recommendedAction?: string;
}

export interface VirtualMachineItem {
  id: string;
  name: string;
  hostServerId: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  cpuUsage: number;
  vcpu?: number;
  ramGb: number;
  ramTotalGb?: number;
  diskGb?: number;
  diskTotalGb?: number;
  networkMbps?: number;
  healthScore?: number;
  cluster?: string;
  environment?: string;
  purpose: 'Kubernetes' | 'Database' | 'Application' | 'Workload' | 'Gateway';
  uptimeHours: number;
  containersCount: number;
  activeAlertsCount: number;
  lastUpdateSecAgo: number;
  source: SourceType;
  hostedContainers: string[];
  problem?: string;
  impact?: string;
  recommendedAction?: string;
}

export interface ContainerPodItem {
  id: string;
  name: string;
  podName: string;
  hostVmId: string;
  hostServerId: string;
  status: 'RUNNING' | 'WARNING' | 'FAILED' | 'PENDING';
  cpuUsage: number;
  ramDisplay: string;
  restarts: number;
  age: string;
  cluster: string;
  namespace: string;
  connectedServices: string[];
  lastUpdateSecAgo: number;
  source: SourceType;
  problem?: string;
  impact?: string;
  recommendedAction?: string;
}

export interface VmProcessItem {
  pid: number;
  name: string;
  cpuPct: number;
  ramGb: number;
  state: 'RUNNING' | 'SLEEPING' | 'ABNORMAL';
  startTime: string;
}

export interface VmAnomalyItem {
  id: string;
  metric: string;
  observed: string;
  baseline: string;
  deviation: string;
  duration: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
}

export interface VmAlertItem {
  id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  metric: string;
  observed: string;
  threshold: string;
  duration: string;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface VmIncidentItem {
  id: string;
  title: string;
  severity: 'WARNING' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';
  startedAt: string;
}

export interface VmLogItem {
  id: string;
  timestamp: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  source: string;
  message: string;
}

export interface VmDigitalTwinFull {
  vm: VirtualMachineItem;
  healthScore: number;
  healthContributors: { name: string; score: number; impact: string }[];
  loadAverage: string;
  processCount: number;
  temperatureC: number | 'N/A';
  ipAddress: string;
  macAddress: string;
  interfaceName: string;
  latencyMs: number;
  networkPackets: string;
  networkErrors: number;
  networkDrops: number;
  virtualSwitch: string;
  storageUsedGb: number;
  storageTotalGb: number;
  readIops: number;
  writeIops: number;
  diskLatencyMs: number;
  diskErrors: number;
  topProcesses: VmProcessItem[];
  anomalies: VmAnomalyItem[];
  alerts: VmAlertItem[];
  incidents: VmIncidentItem[];
  predictiveRisk: {
    title: string;
    riskPct: number;
    confidencePct: number;
    horizon: string;
    model: string;
    evidence: string[];
  };
  maintenanceTasks: {
    task: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    due: string;
    reason: string;
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  }[];
  logs: VmLogItem[];
  securityPosture: {
    authState: string;
    securityEvents: number;
    openPorts: string[];
    configDrift: string;
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  };
  configuration: {
    vcpu: number;
    ramGb: number;
    diskTotalGb: number;
    os: string;
    kernel: string;
    environment: string;
    tags: string[];
  };
  configHistory: { time: string; change: string; user: string; reason: string }[];
  stateHistory: { time: string; state: string; cause: string; duration: string }[];
  eventTimeline: { time: string; event: string; type: string }[];
  dataLineage: string[];
  dependenciesTree: { name: string; type: string; status: string; health: number }[];
}

export const MOCK_SERVERS: ServerNode[] = [
  {
    id: 'dc-node-01',
    hostname: 'dc-node-01',
    rack: 'Rack A',
    status: 'HEALTHY',
    cpuUsage: 42,
    ramUsage: 48,
    diskUsage: 35,
    temperatureC: 38,
    networkMbps: 12,
    uptimeHours: 720,
    vmsCount: 2,
    podsCount: 4,
    lastUpdateSecAgo: 0.8,
    source: 'REAL-TIME LOCAL',
    hostedVms: ['vm-k8s-master-01', 'vm-k8s-worker-01'],
    hostedPods: ['api-service', 'telemetry-service'],
    activeAlertsCount: 0,
  },
  {
    id: 'dc-node-02',
    hostname: 'dc-node-02',
    rack: 'Rack A',
    status: 'HEALTHY',
    cpuUsage: 35,
    ramUsage: 52,
    diskUsage: 40,
    temperatureC: 40,
    networkMbps: 18,
    uptimeHours: 540,
    vmsCount: 1,
    podsCount: 3,
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
    hostedVms: ['vm-db-postgresql'],
    hostedPods: ['postgres'],
    activeAlertsCount: 0,
  },
  {
    id: 'dc-node-03',
    hostname: 'dc-node-03',
    rack: 'Rack B',
    status: 'CRITICAL',
    cpuUsage: 31,
    ramUsage: 59,
    diskUsage: 42,
    temperatureC: 41,
    networkMbps: 44,
    uptimeHours: 396,
    vmsCount: 1,
    podsCount: 1,
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
    hostedVms: ['vm-legacy-app'],
    hostedPods: ['legacy-api'],
    activeAlertsCount: 2,
    problem: 'CPU saturation',
    impact: 'vm-legacy-app affected',
    recommendedAction: 'Investigate top process',
  },
  {
    id: 'dc-node-04',
    hostname: 'dc-node-04',
    rack: 'Rack B',
    status: 'WARNING',
    cpuUsage: 72,
    ramUsage: 82,
    diskUsage: 68,
    temperatureC: 52,
    networkMbps: 58,
    uptimeHours: 280,
    vmsCount: 2,
    podsCount: 3,
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
    hostedVms: ['vm-workload-temp', 'vm-k8s-worker-02'],
    hostedPods: ['copilot-service', 'digital-twin-engine'],
    activeAlertsCount: 1,
    problem: 'High Memory pressure',
    impact: 'vm-workload-temp degradation',
    recommendedAction: 'Inspect VM memory allocation',
  },
  {
    id: 'dc-node-05',
    hostname: 'dc-node-05',
    rack: 'Rack A',
    status: 'HEALTHY',
    cpuUsage: 28,
    ramUsage: 42,
    diskUsage: 30,
    temperatureC: 36,
    networkMbps: 10,
    uptimeHours: 840,
    vmsCount: 1,
    podsCount: 2,
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
    hostedVms: ['vm-ingress-01'],
    hostedPods: ['auth-gateway'],
    activeAlertsCount: 0,
  },
  {
    id: 'dc-node-06',
    hostname: 'dc-node-06',
    rack: 'Rack A',
    status: 'HEALTHY',
    cpuUsage: 30,
    ramUsage: 45,
    diskUsage: 32,
    temperatureC: 37,
    networkMbps: 14,
    uptimeHours: 620,
    vmsCount: 1,
    podsCount: 2,
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
    hostedVms: ['vm-edge-gateway'],
    hostedPods: ['redis-cache'],
    activeAlertsCount: 0,
  },
  {
    id: 'dc-node-07',
    hostname: 'dc-node-07',
    rack: 'Rack A',
    status: 'HEALTHY',
    cpuUsage: 22,
    ramUsage: 38,
    diskUsage: 25,
    temperatureC: 35,
    networkMbps: 8,
    uptimeHours: 910,
    vmsCount: 0,
    podsCount: 1,
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
    hostedVms: [],
    hostedPods: ['metrics-collector'],
    activeAlertsCount: 0,
  },
  {
    id: 'dc-node-08',
    hostname: 'dc-node-08',
    rack: 'Rack A',
    status: 'HEALTHY',
    cpuUsage: 25,
    ramUsage: 40,
    diskUsage: 28,
    temperatureC: 36,
    networkMbps: 9,
    uptimeHours: 780,
    vmsCount: 0,
    podsCount: 1,
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
    hostedVms: [],
    hostedPods: ['log-forwarder'],
    activeAlertsCount: 0,
  },
  {
    id: 'dc-node-09',
    hostname: 'dc-node-09',
    rack: 'Rack B',
    status: 'HEALTHY',
    cpuUsage: 33,
    ramUsage: 50,
    diskUsage: 36,
    temperatureC: 39,
    networkMbps: 16,
    uptimeHours: 490,
    vmsCount: 0,
    podsCount: 0,
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
    hostedVms: [],
    hostedPods: [],
    activeAlertsCount: 0,
  },
  {
    id: 'dc-node-10',
    hostname: 'dc-node-10',
    rack: 'Rack B',
    status: 'HEALTHY',
    cpuUsage: 19,
    ramUsage: 32,
    diskUsage: 20,
    temperatureC: 34,
    networkMbps: 6,
    uptimeHours: 1100,
    vmsCount: 0,
    podsCount: 0,
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
    hostedVms: [],
    hostedPods: [],
    activeAlertsCount: 0,
  },
  {
    id: 'dc-node-11',
    hostname: 'dc-node-11',
    rack: 'Rack B',
    status: 'HEALTHY',
    cpuUsage: 26,
    ramUsage: 41,
    diskUsage: 29,
    temperatureC: 37,
    networkMbps: 11,
    uptimeHours: 650,
    vmsCount: 0,
    podsCount: 0,
    lastUpdateSecAgo: 0.8,
    source: 'TARGET / FUTURE',
    hostedVms: [],
    hostedPods: [],
    activeAlertsCount: 0,
  },
  {
    id: 'dc-node-12',
    hostname: 'dc-node-12',
    rack: 'Rack B',
    status: 'OFFLINE',
    cpuUsage: 0,
    ramUsage: 0,
    diskUsage: 0,
    temperatureC: 0,
    networkMbps: 0,
    uptimeHours: 0,
    vmsCount: 0,
    podsCount: 0,
    lastUpdateSecAgo: 47,
    source: 'TARGET / FUTURE',
    hostedVms: [],
    hostedPods: [],
    activeAlertsCount: 1,
    problem: 'Node Disconnected',
    impact: 'Planned node offline for maintenance',
    recommendedAction: 'Check physical power link',
  },
];

export const MOCK_VMS: VirtualMachineItem[] = [
  {
    id: 'vm-k8s-master-01',
    name: 'Kubernetes Master Node 01',
    hostServerId: 'dc-node-01',
    status: 'HEALTHY',
    cpuUsage: 42,
    ramGb: 16,
    ramTotalGb: 32,
    diskGb: 280,
    diskTotalGb: 500,
    networkMbps: 48,
    healthScore: 95,
    cluster: 'IRISYN-CLUSTER-01',
    environment: 'PRODUCTION',
    purpose: 'Kubernetes',
    uptimeHours: 720,
    containersCount: 3,
    activeAlertsCount: 0,
    lastUpdateSecAgo: 0.8,
    source: 'REAL-TIME LOCAL',
    hostedContainers: ['k8s-api-server', 'etcd-cluster', 'kube-controller'],
  },
  {
    id: 'vm-k8s-worker-01',
    name: 'Kubernetes Worker Node 01',
    hostServerId: 'dc-node-02',
    status: 'HEALTHY',
    cpuUsage: 58,
    ramGb: 32,
    ramTotalGb: 64,
    diskGb: 420,
    diskTotalGb: 1024,
    networkMbps: 84,
    healthScore: 92,
    cluster: 'IRISYN-CLUSTER-01',
    environment: 'PRODUCTION',
    purpose: 'Kubernetes',
    uptimeHours: 1284,
    containersCount: 6,
    activeAlertsCount: 0,
    lastUpdateSecAgo: 0.8,
    source: 'REAL-TIME LOCAL',
    hostedContainers: ['api-service', 'telemetry-service', 'ingress-controller', 'node-exporter', 'copilot-service', 'postgres'],
  },
  {
    id: 'vm-db-postgresql',
    name: 'PostgreSQL Relational DB Node',
    hostServerId: 'dc-node-02',
    status: 'HEALTHY',
    cpuUsage: 31,
    ramGb: 16,
    ramTotalGb: 32,
    diskGb: 512,
    diskTotalGb: 1024,
    networkMbps: 36,
    healthScore: 94,
    cluster: 'IRISYN-DB-CLUSTER',
    environment: 'PRODUCTION',
    purpose: 'Database',
    uptimeHours: 540,
    containersCount: 2,
    activeAlertsCount: 0,
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
    hostedContainers: ['postgres', 'pg-exporter'],
  },
  {
    id: 'vm-legacy-app',
    name: 'Legacy Core Workload VM',
    hostServerId: 'dc-node-03',
    status: 'WARNING',
    cpuUsage: 72,
    ramGb: 8,
    ramTotalGb: 16,
    diskGb: 320,
    diskTotalGb: 500,
    networkMbps: 62,
    healthScore: 78,
    cluster: 'IRISYN-APP-CLUSTER',
    environment: 'STAGING',
    purpose: 'Application',
    uptimeHours: 396,
    containersCount: 2,
    activeAlertsCount: 1,
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
    hostedContainers: ['legacy-api', 'legacy-worker'],
    problem: 'Memory pressure',
    impact: 'Application latency increasing',
    recommendedAction: 'Inspect workload',
  },
  {
    id: 'vm-workload-temp',
    name: 'Temporary Workload Processing VM',
    hostServerId: 'dc-node-04',
    status: 'CRITICAL',
    cpuUsage: 91,
    ramGb: 16,
    ramTotalGb: 16,
    diskGb: 480,
    diskTotalGb: 500,
    networkMbps: 95,
    healthScore: 61,
    cluster: 'IRISYN-TEMP-CLUSTER',
    environment: 'DEVELOPMENT',
    purpose: 'Workload',
    uptimeHours: 142,
    containersCount: 3,
    activeAlertsCount: 2,
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
    hostedContainers: ['batch-analytics', 'data-pipeline-worker', 'temp-evaluator'],
    problem: 'CPU saturation',
    impact: 'Workload queue backed up',
    recommendedAction: 'Migrate VM or scale vCPU',
  },
  {
    id: 'vm-k8s-worker-02',
    name: 'Kubernetes Worker Node 02',
    hostServerId: 'dc-node-04',
    status: 'HEALTHY',
    cpuUsage: 38,
    ramGb: 32,
    ramTotalGb: 64,
    diskGb: 390,
    diskTotalGb: 1024,
    networkMbps: 54,
    healthScore: 91,
    cluster: 'IRISYN-CLUSTER-01',
    environment: 'PRODUCTION',
    purpose: 'Kubernetes',
    uptimeHours: 280,
    containersCount: 3,
    activeAlertsCount: 0,
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
    hostedContainers: ['copilot-service', 'digital-twin-engine', 'redis-cache'],
  },
  {
    id: 'vm-ingress-01',
    name: 'Global Ingress Router VM',
    hostServerId: 'dc-node-05',
    status: 'HEALTHY',
    cpuUsage: 24,
    ramGb: 8,
    ramTotalGb: 16,
    diskGb: 120,
    diskTotalGb: 300,
    networkMbps: 110,
    healthScore: 96,
    cluster: 'IRISYN-GATEWAY-CLUSTER',
    environment: 'PRODUCTION',
    purpose: 'Gateway',
    uptimeHours: 840,
    containersCount: 2,
    activeAlertsCount: 0,
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
    hostedContainers: ['auth-gateway', 'nginx-proxy'],
  },
  {
    id: 'vm-edge-gateway',
    name: 'Industrial Edge Proxy VM',
    hostServerId: 'dc-node-06',
    status: 'HEALTHY',
    cpuUsage: 28,
    ramGb: 8,
    ramTotalGb: 16,
    diskGb: 180,
    diskTotalGb: 300,
    networkMbps: 22,
    healthScore: 95,
    cluster: 'IRISYN-EDGE-CLUSTER',
    environment: 'PRODUCTION',
    purpose: 'Gateway',
    uptimeHours: 620,
    containersCount: 1,
    activeAlertsCount: 0,
    lastUpdateSecAgo: 0.8,
    source: 'REAL-TIME LOCAL',
    hostedContainers: ['industrial-edge-connector'],
  },
];

export const MOCK_PODS: ContainerPodItem[] = [
  {
    id: 'pod-1',
    name: 'api-service',
    podName: 'api-service-7f8d9b-x4k',
    hostVmId: 'vm-k8s-worker-01',
    hostServerId: 'dc-node-01',
    status: 'RUNNING',
    cpuUsage: 22,
    ramDisplay: '1.4 GB',
    restarts: 0,
    age: '4 days',
    cluster: 'prod-cluster',
    namespace: 'irisyn',
    connectedServices: ['Telemetry API', 'Database', 'Auth Service'],
    lastUpdateSecAgo: 0.8,
    source: 'REAL-TIME LOCAL',
  },
  {
    id: 'pod-2',
    name: 'telemetry-service',
    podName: 'telemetry-service-6b4c5d-m8p',
    hostVmId: 'vm-k8s-worker-01',
    hostServerId: 'dc-node-01',
    status: 'RUNNING',
    cpuUsage: 31,
    ramDisplay: '920 MB',
    restarts: 0,
    age: '4 days',
    cluster: 'prod-cluster',
    namespace: 'irisyn',
    connectedServices: ['WebSocket Gateway', 'MQTT Ingestion', 'TimescaleDB'],
    lastUpdateSecAgo: 0.8,
    source: 'REAL-TIME LOCAL',
  },
  {
    id: 'pod-3',
    name: 'copilot-service',
    podName: 'copilot-service-5d6e7f-k9q',
    hostVmId: 'vm-k8s-worker-02',
    hostServerId: 'dc-node-04',
    status: 'RUNNING',
    cpuUsage: 18,
    ramDisplay: '740 MB',
    restarts: 0,
    age: '3 days',
    cluster: 'prod-cluster',
    namespace: 'irisyn',
    connectedServices: ['AI Inference Engine', 'Data Gate', 'Asset Model API'],
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
  },
  {
    id: 'pod-4',
    name: 'digital-twin-engine',
    podName: 'digital-twin-engine-9a8b7c-w2r',
    hostVmId: 'vm-k8s-worker-02',
    hostServerId: 'dc-node-04',
    status: 'RUNNING',
    cpuUsage: 26,
    ramDisplay: '1.1 GB',
    restarts: 0,
    age: '4 days',
    cluster: 'prod-cluster',
    namespace: 'irisyn',
    connectedServices: ['3D WebGL Renderer', 'Physics Simulation', 'Telemetry Stream'],
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
  },
  {
    id: 'pod-5',
    name: 'postgres',
    podName: 'postgres-db-main-0',
    hostVmId: 'vm-db-postgresql',
    hostServerId: 'dc-node-02',
    status: 'RUNNING',
    cpuUsage: 34,
    ramDisplay: '3.2 GB',
    restarts: 0,
    age: '8 days',
    cluster: 'db-cluster',
    namespace: 'database',
    connectedServices: ['API Service', 'Audit Logging', 'Settings Engine'],
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
  },
  {
    id: 'pod-6',
    name: 'legacy-api',
    podName: 'legacy-api-v1-88f9c-z2m',
    hostVmId: 'vm-legacy-app',
    hostServerId: 'dc-node-03',
    status: 'WARNING',
    cpuUsage: 79,
    ramDisplay: '5.8 GB',
    restarts: 4,
    age: '2 hours',
    cluster: 'app-cluster',
    namespace: 'legacy',
    connectedServices: ['Telemetry API', 'WebSocket', 'Database'],
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
    problem: 'Repeated container restarts',
    impact: 'Service instability',
    recommendedAction: 'View logs and investigate',
  },
  {
    id: 'pod-7',
    name: 'batch-analytics',
    podName: 'batch-analytics-job-44a1',
    hostVmId: 'vm-workload-temp',
    hostServerId: 'dc-node-04',
    status: 'FAILED',
    cpuUsage: 94,
    ramDisplay: '7.2 GB',
    restarts: 6,
    age: '45 mins',
    cluster: 'app-cluster',
    namespace: 'analytics',
    connectedServices: ['Postgres', 'TimescaleDB'],
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
    problem: 'OOM Killed (Out of Memory)',
    impact: 'Batch processing halted',
    recommendedAction: 'Increase memory limit or optimize batch size',
  },
  {
    id: 'pod-8',
    name: 'auth-gateway',
    podName: 'auth-gateway-11b2c-p9x',
    hostVmId: 'vm-ingress-01',
    hostServerId: 'dc-node-05',
    status: 'RUNNING',
    cpuUsage: 14,
    ramDisplay: '512 MB',
    restarts: 0,
    age: '10 days',
    cluster: 'prod-cluster',
    namespace: 'irisyn',
    connectedServices: ['User Directory', 'JWT Validator', 'RBAC Matrix'],
    lastUpdateSecAgo: 0.8,
    source: 'SIMULATED',
  },
  {
    id: 'pod-9',
    name: 'redis-cache',
    podName: 'redis-cluster-node-0',
    hostVmId: 'vm-edge-gateway',
    hostServerId: 'dc-node-06',
    status: 'RUNNING',
    cpuUsage: 19,
    ramDisplay: '850 MB',
    restarts: 0,
    age: '6 days',
    cluster: 'prod-cluster',
    namespace: 'irisyn',
    connectedServices: ['Telemetry Service', 'API Gateway'],
    lastUpdateSecAgo: 0.8,
    source: 'REAL-TIME LOCAL',
  },
  {
    id: 'pod-10',
    name: 'industrial-edge-connector',
    podName: 'edge-connector-opc-ua-1',
    hostVmId: 'vm-edge-gateway',
    hostServerId: 'dc-node-06',
    status: 'RUNNING',
    cpuUsage: 25,
    ramDisplay: '620 MB',
    restarts: 0,
    age: '5 days',
    cluster: 'prod-cluster',
    namespace: 'irisyn',
    connectedServices: ['OPC-UA Server', 'MQTT Broker'],
    lastUpdateSecAgo: 0.8,
    source: 'REAL-TIME LOCAL',
  },
];

export const getVmDigitalTwin = (vmId: string): VmDigitalTwinFull => {
  const baseVm = MOCK_VMS.find((v) => v.id === vmId || v.name === vmId) || MOCK_VMS[1];

  const isWarning = baseVm.status === 'WARNING';
  const isCritical = baseVm.status === 'CRITICAL';
  const healthScore = baseVm.healthScore || (isCritical ? 61 : isWarning ? 78 : 92);

  return {
    vm: baseVm,
    healthScore,
    healthContributors: [
      { name: 'CPU Health', score: isCritical ? 62 : isWarning ? 75 : 92, impact: 'vCPU quota evaluation' },
      { name: 'Memory Health', score: isWarning ? 68 : 95, impact: 'RAM allocation buffer' },
      { name: 'Disk Health', score: 88, impact: 'Root volume IOPS latency' },
      { name: 'Network Health', score: 94, impact: 'Interface packet throughput' },
      { name: 'Process Stability', score: isCritical ? 71 : 91, impact: 'Sub-process exit status' },
      { name: 'Workload Stability', score: isCritical ? 65 : 90, impact: 'Pod restart count ratio' },
    ],
    loadAverage: isCritical ? '4.82, 3.95, 3.12' : isWarning ? '2.84, 2.10, 1.95' : '1.45, 1.20, 1.05',
    processCount: 248,
    temperatureC: baseVm.hostServerId === 'dc-node-01' ? 38 : 41,
    ipAddress: '10.244.1.18',
    macAddress: '52:54:00:ab:42:19',
    interfaceName: 'eth0',
    latencyMs: 1.2,
    networkPackets: '14.2k/s',
    networkErrors: 0,
    networkDrops: 0,
    virtualSwitch: 'vswitch-01',
    storageUsedGb: baseVm.diskGb || 420,
    storageTotalGb: baseVm.diskTotalGb || 1024,
    readIops: 820,
    writeIops: 430,
    diskLatencyMs: isCritical ? 18.4 : 3.2,
    diskErrors: 0,
    topProcesses: [
      { pid: 1420, name: 'python', cpuPct: isCritical ? 48 : 22, ramGb: 4.2, state: 'RUNNING', startTime: '12:04' },
      { pid: 1845, name: 'node', cpuPct: 14, ramGb: 2.1, state: 'RUNNING', startTime: '12:00' },
      { pid: 2104, name: 'java', cpuPct: 11, ramGb: 6.4, state: 'RUNNING', startTime: '10:15' },
      { pid: 912, name: 'kubelet', cpuPct: 5, ramGb: 1.2, state: 'RUNNING', startTime: 'Yesterday' },
      { pid: 850, name: 'containerd', cpuPct: 4, ramGb: 0.89, state: 'RUNNING', startTime: 'Yesterday' },
    ],
    anomalies: isCritical
      ? [
          {
            id: 'anom-101',
            metric: 'CPU Saturation',
            observed: '91%',
            baseline: '54%',
            deviation: '+37%',
            duration: '12 min',
            severity: 'CRITICAL',
            description: 'vCPU compute pipeline saturated by batch analytics thread',
          },
          {
            id: 'anom-102',
            metric: 'Disk Latency',
            observed: '18.4 ms',
            baseline: '3.2 ms',
            deviation: '+15.2 ms',
            duration: '25 min',
            severity: 'MEDIUM',
            description: 'Elevated read IOPS contention on root volume',
          },
        ]
      : isWarning
      ? [
          {
            id: 'anom-103',
            metric: 'Memory Pressure',
            observed: '88%',
            baseline: '52%',
            deviation: '+36%',
            duration: '18 min',
            severity: 'HIGH',
            description: 'Sub-workload cgroup approaching memory limit',
          },
        ]
      : [],
    alerts: isCritical
      ? [
          {
            id: 'ALT-1041',
            severity: 'CRITICAL',
            metric: 'CPU Saturation',
            observed: '91%',
            threshold: '90%',
            duration: '7 min',
            status: 'ACTIVE',
          },
        ]
      : isWarning
      ? [
          {
            id: 'ALT-1038',
            severity: 'WARNING',
            metric: 'Memory Limit',
            observed: '88%',
            threshold: '85%',
            duration: '14 min',
            status: 'ACTIVE',
          },
        ]
      : [],
    incidents: isCritical
      ? [
          {
            id: 'INC-2026-004',
            title: 'CPU resource saturation on VM',
            severity: 'CRITICAL',
            status: 'INVESTIGATING',
            startedAt: '14:22',
          },
        ]
      : [],
    predictiveRisk: {
      title: 'Resource Exhaustion Risk',
      riskPct: isCritical ? 88 : isWarning ? 68 : 12,
      confidencePct: 82,
      horizon: '24 hours',
      model: 'ResourceRisk v1',
      evidence: [
        'CPU utilization trend increasing +4.2%/hr',
        'Memory buffer pressure steadily climbing',
        'Disk latency variance elevated above baseline',
      ],
    },
    maintenanceTasks: [
      {
        task: 'Storage & Log Cleanup',
        priority: 'MEDIUM',
        due: 'Tomorrow',
        reason: 'Disk utilization at 87% threshold',
        status: 'PLANNED',
      },
      {
        task: 'Kernel & Agent Patching',
        priority: 'LOW',
        due: 'In 3 days',
        reason: 'Security patch v5.15.0-90 available',
        status: 'PLANNED',
      },
    ],
    logs: [
      {
        id: 'log-1',
        timestamp: '14:32:01',
        severity: 'INFO',
        source: 'kubelet',
        message: 'Workload container telemetry-service status reported healthy.',
      },
      {
        id: 'log-2',
        timestamp: '14:28:44',
        severity: isWarning || isCritical ? 'WARNING' : 'INFO',
        source: 'kernel',
        message: 'Memory cgroup memory pressure warning on cgroup /k8s/vm-workload.',
      },
      {
        id: 'log-3',
        timestamp: '14:22:10',
        severity: isCritical ? 'ERROR' : 'INFO',
        source: 'python',
        message: 'Memory Allocation Warning: Buffer overflow risk threshold approached.',
      },
    ],
    securityPosture: {
      authState: 'HEALTHY / AUTHORIZED',
      securityEvents: 0,
      openPorts: ['22 (SSH)', '6443 (k8s-api)', '10250 (kubelet)'],
      configDrift: 'NONE DETECTED',
      status: 'HEALTHY',
    },
    configuration: {
      vcpu: baseVm.vcpu || 8,
      ramGb: baseVm.ramGb || 32,
      diskTotalGb: baseVm.diskTotalGb || 1024,
      os: 'Ubuntu 22.04 LTS Linux',
      kernel: '5.15.0-88-generic',
      environment: baseVm.environment || 'PRODUCTION',
      tags: ['k8s', 'worker', 'production', 'cloud-init'],
    },
    configHistory: [
      { time: '14:32', change: 'Memory: 16 GB → 32 GB', user: 'Engineer-01', reason: 'Workload expansion' },
      { time: '14:12', change: 'vCPU: 4 → 8', user: 'Admin', reason: 'Capacity scaling' },
    ],
    stateHistory: [
      { time: '14:35', state: 'RECOVERED', cause: 'Mitigation applied', duration: '12 min' },
      { time: '14:27', state: 'DEGRADED', cause: 'High compute load', duration: '8 min' },
      { time: '14:22', state: 'HIGH LOAD', cause: 'Batch process start', duration: '5 min' },
      { time: '12:00', state: 'RUNNING', cause: 'Normal state', duration: '2 hours' },
    ],
    eventTimeline: [
      { time: '14:22', event: 'CPU utilization spike detected above 85%', type: 'TELEMETRY' },
      { time: '14:24', event: 'Memory pressure increased', type: 'METRIC' },
      { time: '14:25', event: 'Anomaly ANOM-101 registered', type: 'ANOMALY' },
      { time: '14:27', event: 'Alert ALT-1041 triggered', type: 'ALERT' },
      { time: '14:29', event: 'Health score adjusted to 61%', type: 'HEALTH' },
      { time: '14:32', event: 'Engineer-01 started investigation', type: 'AUDIT' },
    ],
    dataLineage: [
      `Physical Host / Hypervisor (${baseVm.hostServerId})`,
      'VM Agent / Collector (libvirt/qemu-guest-agent)',
      'Telemetry Collector Gateway',
      'Data Quality Validation Gate',
      'Time-Series TSDB (TimescaleDB)',
      'Digital Twin State Engine',
      `VM Digital Twin (${baseVm.name})`,
      'Dashboard & Copilot Context',
    ],
    dependenciesTree: [
      { name: baseVm.hostServerId, type: 'Physical Host Server', status: 'HEALTHY', health: 95 },
      { name: baseVm.name, type: 'Virtual Machine', status: baseVm.status, health: healthScore },
      { name: 'telemetry-service', type: 'Container Pod', status: 'RUNNING', health: 98 },
      { name: 'WebSocket Gateway', type: 'Service Endpoint', status: 'RUNNING', health: 100 },
      { name: 'IRISYN Dashboard', type: 'Application View', status: 'RUNNING', health: 100 },
    ],
  };
};
