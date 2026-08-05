import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { getContainers } from '@/services/containers.service';
import { Container } from '@/types/domain';
import PageLoader from '@/components/loading/PageLoader';
import ErrorState from '@/components/error/ErrorState';

const Containers = () => {
  const { data: containers, isLoading, error, refetch } = useQuery({
    queryKey: ['containers'],
    queryFn: getContainers,
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Containers" description="Loading pods and containers...">
        <PageLoader />
      </DashboardLayout>
    );
  }

  if (error || !containers) {
    return (
      <DashboardLayout title="Containers" description="Offline">
        <ErrorState message="Failed to load containers." onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Containers" description="Pod and container status">
      <DataTable<Container>
        rowKey={(c) => c.id}
        rows={containers}
        columns={[
          { key: 'name', header: 'Name', accessor: (c) => c.name },
          { key: 'pod', header: 'Pod', accessor: (c) => c.podName },
          { key: 'image', header: 'Image', accessor: (c) => c.image },
          { key: 'status', header: 'Status', accessor: (c) => <Badge status={c.status} /> },
          { key: 'cpu', header: 'CPU', accessor: (c) => <div className="w-24"><ProgressBar value={c.cpuUsage} /></div> },
          { key: 'ram', header: 'RAM', accessor: (c) => <div className="w-24"><ProgressBar value={c.ramUsage} /></div> },
        ]}
      />
    </DashboardLayout>
  );
};

export default Containers;
