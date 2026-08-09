import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import ClusterHealthCards from '@/components/dashboard/ClusterHealthCards';
import ResourceChart from '@/components/dashboard/ResourceChart';
import IncidentTimeline from '@/components/dashboard/IncidentTimeline';
import RecentActivity from '@/components/dashboard/RecentActivity';
import ServerGrid from '@/components/dashboard/ServerGrid';
import AutomationStatus from '@/components/dashboard/AutomationStatus';
import DigitalTwinView from '@/components/digital-twin/DigitalTwinView';
import { getServers } from '@/services/servers.service';
import { getAlerts } from '@/services/alerts.service';
import { getClusterSummary } from '@/services/cluster.service';
import { getMetrics } from '@/services/metrics.service';
import { useWebSocketMetrics } from '@/hooks/useWebSocketMetrics';
import SimulationControlBar from '@/components/simulation/SimulationControlBar';
import { mockCluster, mockMetrics, mockServers } from '@/services/mockData';

const Dashboard = () => {
  // Connect to real-time WebSocket updates
  useWebSocketMetrics();

  // Fetch REST data with graceful fallbacks
  const { data: servers = mockServers, refetch: refetchServers } = useQuery({
    queryKey: ['servers'],
    queryFn: getServers,
    retry: 1,
  });

  const { refetch: refetchAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: getAlerts,
    retry: 1,
  });

  const { data: cluster = mockCluster, refetch: refetchCluster } = useQuery({
    queryKey: ['cluster'],
    queryFn: getClusterSummary,
    retry: 1,
  });

  const { data: metrics = mockMetrics, refetch: refetchMetrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: getMetrics,
    retry: 1,
  });

  const handleRetry = () => {
    refetchServers();
    refetchAlerts();
    refetchCluster();
    refetchMetrics();
  };

  return (
    <DashboardLayout
      title="Operational Dashboard"
      description="SEE • PREDICT • ACT — Real-Time Local Host & Industrial Digital Twins"
    >
      <SimulationControlBar onScenarioChange={handleRetry} />

      {/* Cluster Health Cards */}
      <ClusterHealthCards cluster={cluster} />

      {/* Resource Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <ResourceChart title="CPU" data={metrics} dataKey="cpu" color="#2f7cf6" />
        <ResourceChart title="RAM" data={metrics} dataKey="ram" color="#22c55e" />
        <ResourceChart title="Disk" data={metrics} dataKey="disk" color="#f59e0b" />
        <ResourceChart title="Network" data={metrics} dataKey="network" color="#a855f7" />
      </div>

      {/* Main Grid: Server Grid, Digital Twin View, Incident Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <ServerGrid servers={servers} />
          <DigitalTwinView />
        </div>
        <div className="space-y-4">
          <IncidentTimeline />
          <AutomationStatus />
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
