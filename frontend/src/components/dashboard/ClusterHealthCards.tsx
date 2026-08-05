import { Server, Cpu, MemoryStick, Activity } from 'lucide-react';
import StatCard from '../ui/StatCard';
import { ClusterSummary } from '@/types/domain';

const ClusterHealthCards = ({ cluster }: { cluster: ClusterSummary }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <StatCard label="Total Nodes" value={cluster.totalNodes} icon={<Server size={20} />} />
    <StatCard
      label="Healthy Nodes"
      value={cluster.healthyNodes}
      icon={<Activity size={20} />}
      tone="success"
      trend={{ value: `${cluster.degradedNodes} degraded`, positive: cluster.degradedNodes === 0 }}
    />
    <StatCard label="Avg CPU" value={`${cluster.cpuAverage}%`} icon={<Cpu size={20} />} tone={cluster.cpuAverage > 80 ? 'danger' : 'default'} />
    <StatCard label="Avg RAM" value={`${cluster.ramAverage}%`} icon={<MemoryStick size={20} />} tone={cluster.ramAverage > 80 ? 'warning' : 'default'} />
  </div>
);

export default ClusterHealthCards;
