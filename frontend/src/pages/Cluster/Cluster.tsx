import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import ClusterHealthCards from '@/components/dashboard/ClusterHealthCards';
import StatCard from '@/components/ui/StatCard';
import { getClusterSummary } from '@/services/cluster.service';
import PageLoader from '@/components/loading/PageLoader';
import { Boxes, GitBranch, Layers, Library, HardDrive, Shield } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { mockCluster } from '@/services/mockData';

const Cluster = () => {
  const { data: cluster = mockCluster, isLoading } = useQuery({
    queryKey: ['cluster'],
    queryFn: getClusterSummary,
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Cluster" description="Loading cluster health summary...">
        <PageLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Cluster" description="Cluster-wide health and OpenShift orchestration summary">
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">Infrastructure Overview</h3>
          <ClusterHealthCards cluster={cluster} />
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">OpenShift Cluster Orchestration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <StatCard
              label="Running Pods"
              value={cluster.podsCount ?? 48}
              icon={<Boxes className="text-blue-500" size={20} />}
            />
            <StatCard
              label="Deployments"
              value={cluster.deploymentsCount ?? 16}
              icon={<Layers className="text-indigo-500" size={20} />}
            />
            <StatCard
              label="Namespaces"
              value={cluster.namespacesCount ?? 6}
              icon={<GitBranch className="text-purple-500" size={20} />}
            />
            <StatCard
              label="Services"
              value={cluster.servicesCount ?? 22}
              icon={<Library className="text-pink-500" size={20} />}
            />
            <StatCard
              label="Storage Allocation"
              value={`${cluster.storageUsage ?? 64}%`}
              icon={<HardDrive className="text-amber-500" size={20} />}
              tone={(cluster.storageUsage ?? 64) > 90 ? 'danger' : 'default'}
            />
            <div className="card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Overall Health
                </span>
                <Shield className="text-emerald-500" size={20} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                  {cluster.overallHealth ?? 'HEALTHY'}
                </span>
                <Badge status={cluster.overallHealth === 'HEALTHY' ? 'HEALTHY' : (cluster.overallHealth === 'WARNING' ? 'WARNING' : 'CRITICAL')} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Cluster;
