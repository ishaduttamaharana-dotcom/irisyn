import { Alert, ClusterSummary, Container, MetricPoint, Server, VirtualMachine } from '@/types/domain';

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
  { id: 'al-2', severity: 'WARNING', message: 'Rack B ambient temperature rising', source: 'Rack B', createdAt: new Date().toISOString(), acknowledged: false },
  { id: 'al-3', severity: 'INFO', message: 'Automation job "nightly-backup" completed', source: 'automation', createdAt: new Date().toISOString(), acknowledged: true },
];

export const mockCluster: ClusterSummary = {
  totalNodes: mockServers.length,
  healthyNodes: mockServers.filter((s) => s.status === 'HEALTHY').length,
  degradedNodes: mockServers.filter((s) => s.status === 'WARNING').length,
  offlineNodes: mockServers.filter((s) => s.status === 'OFFLINE').length,
  cpuAverage: Math.round(mockServers.reduce((a, s) => a + s.cpuUsage, 0) / mockServers.length),
  ramAverage: Math.round(mockServers.reduce((a, s) => a + s.ramUsage, 0) / mockServers.length),
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
