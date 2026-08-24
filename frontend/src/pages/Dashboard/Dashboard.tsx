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
import { getLiveTelemetry } from '@/services/telemetry.service';
import { useWebSocketMetrics } from '@/hooks/useWebSocketMetrics';
import SimulationControlBar from '@/components/simulation/SimulationControlBar';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import { mockCluster, mockMetrics, mockServers } from '@/services/mockData';
import { Brain, Wrench, Activity, Cpu, HardDrive, Zap, Wifi } from 'lucide-react';
import { getFreshnessInfo } from '@/utils/freshnessUtils';

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

  const { data: liveTelemetry } = useQuery({
    queryKey: ['liveTelemetry'],
    queryFn: getLiveTelemetry,
    refetchInterval: 1500,
  });

  const handleRetry = () => {
    refetchServers();
    refetchAlerts();
    refetchCluster();
    refetchMetrics();
  };

  const laptopMetrics = liveTelemetry?.data?.metrics || liveTelemetry?.metrics;
  const freshnessInfo = getFreshnessInfo(liveTelemetry?.data?.timestamp || liveTelemetry?.timestamp);

  return (
    <DashboardLayout
      title="Predictive Operations Center"
      description="AI-Powered Digital Twin & Operational Intelligence Platform"
    >
      <div className="space-y-6">
        <SimulationControlBar onScenarioChange={handleRetry} />

        {/* 1. KPI Row — WHAT IS HAPPENING? */}
        <ClusterHealthCards cluster={cluster} />

        {/* 2. Live Telemetry Stream — WHAT IS WRONG? */}
        <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                Live Host Hardware Telemetry Stream
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${freshnessInfo.badgeClass}`}>
                {freshnessInfo.label}
              </span>
            </div>
            <DataSourceBadge source="REAL-TIME LOCAL" size="sm" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1 font-mono">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 font-sans text-[11px] block flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU LOAD
              </span>
              <strong className="text-xl text-cyan-300 font-bold mt-1 block">{laptopMetrics?.cpu ?? 24.2}%</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">SLA: {freshnessInfo.freshnessMs}ms</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 font-sans text-[11px] block flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> RAM UTILIZATION
              </span>
              <strong className="text-xl text-emerald-300 font-bold mt-1 block">{laptopMetrics?.ram ?? 48.5}%</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">SLA: {freshnessInfo.freshnessMs}ms</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 font-sans text-[11px] block flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> TEMPERATURE
              </span>
              <strong className="text-xl text-amber-300 font-bold mt-1 block">{laptopMetrics?.temperature ?? 44.5}°C</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">SLA: {freshnessInfo.freshnessMs}ms</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 font-sans text-[11px] block flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-indigo-400" /> NETWORK LATENCY
              </span>
              <strong className="text-xl text-indigo-300 font-bold mt-1 block">{laptopMetrics?.networkInKbps ?? 18.4} Kbps</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Latency: 2.4ms</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
            <ResourceChart title="CPU Load (%)" data={metrics} dataKey="cpu" color="#35C9FF" />
            <ResourceChart title="RAM Usage (%)" data={metrics} dataKey="ram" color="#22C55E" />
            <ResourceChart title="Disk I/O (%)" data={metrics} dataKey="disk" color="#F59E0B" />
            <ResourceChart title="Network (Kbps)" data={metrics} dataKey="network" color="#7C5CFF" />
          </div>
        </div>

        {/* 3. Digital Twin Spatial & Asset Racks — WHY? */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <DigitalTwinView />
            <ServerGrid servers={servers} />
          </div>

          {/* 4. AI Insights, Actions & Incident Timeline — WHAT SHOULD I DO? & WHAT HAPPENED BEFORE? */}
          <div className="space-y-6">
            {/* AI Insights Card */}
            <div className="card p-5 bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <h4 className="text-sm font-bold text-slate-100 uppercase">AI Predictive Vector</h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  CONFIDENCE: 94%
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Vibration Z-score on <strong className="text-purple-300">MOTOR-001</strong> indicates early drive bearing degradation. Recommended maintenance window within <strong className="text-amber-400">72 hours</strong>.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Wrench size={12} /> Recommendation: Schedule WO-9041
                </span>
              </div>
            </div>

            {/* Incident Timeline (Locked 420px height) */}
            <IncidentTimeline />

            <AutomationStatus />
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
