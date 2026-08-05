import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { getServers } from '@/services/servers.service';
import { Server } from '@/types/domain';
import PageLoader from '@/components/loading/PageLoader';
import ErrorState from '@/components/error/ErrorState';

const Servers = () => {
  const { data: servers, isLoading, error, refetch } = useQuery({
    queryKey: ['servers'],
    queryFn: getServers,
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Servers" description="Loading physical servers...">
        <PageLoader />
      </DashboardLayout>
    );
  }

  if (error || !servers) {
    return (
      <DashboardLayout title="Servers" description="Offline">
        <ErrorState message="Failed to load servers." onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Servers" description="Physical server inventory across all racks">
      <DataTable<Server>
        rowKey={(s) => s.id}
        rows={servers}
        columns={[
          { key: 'hostname', header: 'Hostname', accessor: (s) => s.hostname },
          { key: 'rack', header: 'Rack', accessor: (s) => s.rack },
          { key: 'status', header: 'Status', accessor: (s) => <Badge status={s.status} /> },
          { key: 'cpu', header: 'CPU', accessor: (s) => <div className="w-24"><ProgressBar value={s.cpuUsage} /></div> },
          { key: 'ram', header: 'RAM', accessor: (s) => <div className="w-24"><ProgressBar value={s.ramUsage} /></div> },
          { key: 'temp', header: 'Temp (°C)', accessor: (s) => s.temperatureC },
          { key: 'uptime', header: 'Uptime (h)', accessor: (s) => s.uptimeHours },
        ]}
      />
    </DashboardLayout>
  );
};

export default Servers;
