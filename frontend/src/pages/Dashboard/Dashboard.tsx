import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import ClusterHealthCards from '@/components/dashboard/ClusterHealthCards';
import ResourceChart from '@/components/dashboard/ResourceChart';
import IncidentTimeline from '@/components/dashboard/IncidentTimeline';
import RecentActivity from '@/components/dashboard/RecentActivity';
import ServerGrid from '@/components/dashboard/ServerGrid';
import AutomationStatus from '@/components/dashboard/AutomationStatus';
import OpenClawChat from '@/components/dashboard/OpenClawChat';
import DigitalTwinView from '@/components/digital-twin/DigitalTwinView';
import { getServers } from '@/services/servers.service';
import { getAlerts } from '@/services/alerts.service';
import { getClusterSummary } from '@/services/cluster.service';
import { getMetrics } from '@/services/metrics.service';
import { useWebSocketMetrics } from '@/hooks/useWebSocketMetrics';
import PageLoader from '@/components/loading/PageLoader';
import ErrorState from '@/components/error/ErrorState';
import SimulationControlBar from '@/components/simulation/SimulationControlBar';

const Dashboard = () => {
  // Connect to real-time WebSocket updates
  useWebSocketMetrics();

  // Fetch initial REST data
  const {
    data: servers,
    isLoading: loadingServers,
    error: errorServers,
    refetch: refetchServers,
  } = useQuery({ queryKey: ['servers'], queryFn: getServers });

  const {
    data: alerts,
    isLoading: loadingAlerts,
    error: errorAlerts,
    refetch: refetchAlerts,
  } = useQuery({ queryKey: ['alerts'], queryFn: getAlerts });

  const {
    data: cluster,
    isLoading: loadingCluster,
    error: errorCluster,
    refetch: refetchCluster,
  } = useQuery({ queryKey: ['cluster'], queryFn: getClusterSummary });

  const {
    data: metrics,
    isLoading: loadingMetrics,
    error: errorMetrics,
    refetch: refetchMetrics,
  } = useQuery({ queryKey: ['metrics'], queryFn: getMetrics });

  const isLoading = loadingServers || loadingAlerts || loadingCluster || loadingMetrics;
  const isError = errorServers || errorAlerts || errorCluster || errorMetrics;

  const handleRetry = () => {
    refetchServers();
    refetchAlerts();
    refetchCluster();
    refetchMetrics();
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard" description="Loading data center twin...">
        <PageLoader />
      </DashboardLayout>
    );
  }

  if (isError || !servers || !alerts || !cluster || !metrics) {
    return (
      <DashboardLayout title="Dashboard" description="Offline">
        <ErrorState message="Could not connect to the Digital Twin backend." onRetry={handleRetry} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Operational Dashboard" description="SEE • PREDICT • ACT — Real-Time Local Host & Industrial Digital Twins">
      <SimulationControlBar onScenarioChange={handleRetry} />
      <ClusterHealthCards cluster={cluster} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <ResourceChart title="CPU" data={metrics} dataKey="cpu" color="#2f7cf6" />
        <ResourceChart title="RAM" data={metrics} dataKey="ram" color="#22c55e" />
        <ResourceChart title="Disk" data={metrics} dataKey="disk" color="#f59e0b" />
        <ResourceChart title="Network" data={metrics} dataKey="network" color="#a855f7" />
      </div>

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

      <OpenClawChat />
    </DashboardLayout>
  );
};

export default Dashboard;
