import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import InfrastructureHierarchyNav from '@/components/infrastructure/InfrastructureHierarchyNav';
import InfrastructureStatusStrip from '@/components/infrastructure/InfrastructureStatusStrip';
import CopilotDrawer from '@/components/copilot/CopilotDrawer';
import {
  MOCK_VMS,
  getVmDigitalTwin,
  VmDigitalTwinFull,
} from '@/services/infrastructureData';
import {
  Box,
  Search,
  Server,
  Layers,
  Bot,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  ExternalLink,
  Terminal,
  Activity,
  ShieldCheck,
  HardDrive,
  Network,
  Clock,
  ArrowLeft,
  Wrench,
  Sparkles,
  Sliders,
} from 'lucide-react';

type TabType =
  | 'OVERVIEW'
  | 'TELEMETRY'
  | 'WORKLOADS'
  | 'NETWORK'
  | 'STORAGE'
  | 'PROCESSES'
  | 'LOGS'
  | 'HEALTH'
  | 'ANOMALIES'
  | 'ALERTS'
  | 'INCIDENTS'
  | 'PREDICTIONS'
  | 'MAINTENANCE'
  | 'CONFIGURATION'
  | 'SECURITY'
  | 'TIMELINE'
  | 'COPILOT';

const VirtualMachines = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialVmId = searchParams.get('id') || searchParams.get('inspect') || searchParams.get('vm');
  const initialHost = searchParams.get('host');

  const [searchQuery, setSearchQuery] = useState('');
  const [hostFilter, setHostFilter] = useState<string>(initialHost || 'All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE'>('All');

  // Active VM Digital Twin selection
  const [selectedVmId, setSelectedVmId] = useState<string | null>(initialVmId || null);
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [logSeverityFilter, setLogSeverityFilter] = useState<'ALL' | 'ERROR' | 'WARNING' | 'INFO'>('ALL');
  const [telemetryTimeframe, setTelemetryTimeframe] = useState<'5m' | '30m' | '1h' | '6h' | '24h' | '7d'>('1h');

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Available host server IDs
  const hostServers = Array.from(new Set(MOCK_VMS.map((v) => v.hostServerId)));

  // Filtered VMs for directory
  const filteredVms = useMemo(() => {
    return MOCK_VMS.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.hostServerId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesHost = hostFilter === 'All' || v.hostServerId === hostFilter;
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      return matchesSearch && matchesHost && matchesStatus;
    });
  }, [searchQuery, hostFilter, statusFilter]);

  // Selected Digital Twin object
  const activeTwin: VmDigitalTwinFull | null = useMemo(() => {
    if (!selectedVmId) return null;
    return getVmDigitalTwin(selectedVmId);
  }, [selectedVmId]);

  const totalCount = MOCK_VMS.length;
  const runningCount = MOCK_VMS.filter((v) => v.status === 'HEALTHY').length;
  const warningCount = MOCK_VMS.filter((v) => v.status === 'WARNING').length;
  const criticalCount = MOCK_VMS.filter((v) => v.status === 'CRITICAL').length;
  const offlineCount = MOCK_VMS.filter((v) => v.status === 'OFFLINE').length;

  const handleSelectVm = (vmId: string) => {
    setSelectedVmId(vmId);
    setSearchParams({ inspect: vmId });
  };

  const handleClearSelection = () => {
    setSelectedVmId(null);
    setSearchParams({});
  };

  const handleInvestigate = () => {
    setIsCopilotOpen(true);
  };

  return (
    <DashboardLayout
      title="Virtual Machines"
      description="Virtual systems, workloads and resource health across IRISYN infrastructure."
    >
      <div className="space-y-6 font-sans">
        {/* Hierarchy Banner */}
        <InfrastructureHierarchyNav />

        {/* Common Status Strip */}
        <InfrastructureStatusStrip />

        {/* ======================================================== */}
        {/* MODE A: VM DIGITAL TWIN WORKSPACE VIEW                   */}
        {/* ======================================================== */}
        {activeTwin ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Top Workspace Header Bar */}
            <div className="p-4 rounded-2xl bg-[#0D121A] border border-[#1E2936] space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2936] pb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleClearSelection}
                    className="p-2 rounded-xl bg-[#111923] hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-[#1E2936] transition-colors"
                    title="Back to Virtual Machines Directory"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                    <Box size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-mono font-bold text-lg text-slate-100">{activeTwin.vm.id}</h2>
                      <span className="text-xs text-slate-400 font-mono">({activeTwin.vm.name})</span>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-extrabold border flex items-center gap-1 ${
                          activeTwin.vm.status === 'CRITICAL'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : activeTwin.vm.status === 'WARNING'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        ● {activeTwin.vm.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {activeTwin.vm.source}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-1">
                      <span>
                        Host:{' '}
                        <button
                          onClick={() => navigate(`/servers?inspect=${activeTwin.vm.hostServerId}`)}
                          className="text-purple-400 font-bold hover:underline"
                        >
                          {activeTwin.vm.hostServerId}
                        </button>
                      </span>
                      <span>Cluster: <strong className="text-slate-200">{activeTwin.vm.cluster || 'IRISYN-CLUSTER-01'}</strong></span>
                      <span>State: <strong className="text-emerald-400">RUNNING</strong></span>
                      <span>
                        Health Score:{' '}
                        <strong className={activeTwin.healthScore < 80 ? 'text-amber-400' : 'text-emerald-400'}>
                          {activeTwin.healthScore}%
                        </strong>
                      </span>
                      <span>Updated: <span className="text-cyan-400">{activeTwin.vm.lastUpdateSecAgo}s ago</span></span>
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <button
                    onClick={handleInvestigate}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all"
                  >
                    <Bot size={15} /> Investigate
                  </button>
                  <button
                    onClick={() => setActiveTab('LOGS')}
                    className="px-3 py-2 rounded-xl bg-[#111923] hover:bg-slate-800 text-slate-300 border border-[#1E2936] transition-colors flex items-center gap-1.5"
                  >
                    <Terminal size={14} /> View Logs
                  </button>
                  <button
                    onClick={() => navigate(`/servers?inspect=${activeTwin.vm.hostServerId}`)}
                    className="px-3 py-2 rounded-xl bg-[#111923] hover:bg-slate-800 text-purple-300 border border-[#1E2936] transition-colors flex items-center gap-1.5"
                  >
                    <Server size={14} /> View Host
                  </button>
                  <button
                    onClick={() => navigate(`/containers?vm=${activeTwin.vm.id}`)}
                    className="px-3 py-2 rounded-xl bg-[#111923] hover:bg-slate-800 text-cyan-300 border border-[#1E2936] transition-colors flex items-center gap-1.5"
                  >
                    <Layers size={14} /> View Containers
                  </button>
                </div>
              </div>

              {/* 17 Tabs Navigation Bar */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-mono scrollbar-thin">
                {(
                  [
                    'OVERVIEW',
                    'TELEMETRY',
                    'WORKLOADS',
                    'NETWORK',
                    'STORAGE',
                    'PROCESSES',
                    'LOGS',
                    'HEALTH',
                    'ANOMALIES',
                    'ALERTS',
                    'INCIDENTS',
                    'PREDICTIONS',
                    'MAINTENANCE',
                    'CONFIGURATION',
                    'SECURITY',
                    'TIMELINE',
                    'COPILOT',
                  ] as TabType[]
                ).map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        if (tab === 'COPILOT') setIsCopilotOpen(true);
                        else setActiveTab(tab);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border ${
                        isActive
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/10'
                          : 'bg-[#111923] hover:bg-[#16212e] text-slate-400 hover:text-slate-200 border-[#1E2936]'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Problem Banner Callout if unhealthy */}
            {activeTwin.vm.problem && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-200 space-y-1.5 font-sans">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
                    <AlertCircle size={18} /> Active Issue Detected: {activeTwin.vm.problem}
                  </div>
                  <button
                    onClick={handleInvestigate}
                    className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-rose-600 text-white hover:bg-rose-500"
                  >
                    Investigate Root Cause
                  </button>
                </div>
                <p className="text-xs text-slate-300"><strong>Impact:</strong> {activeTwin.vm.impact}</p>
                <p className="text-xs text-amber-300 font-mono"><strong>Recommended:</strong> {activeTwin.vm.recommendedAction}</p>
              </div>
            )}

            {/* TAB CONTENT RENDERERS */}
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6">
                {/* KPI Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">CPU Utilization</span>
                    <strong className={`text-xl font-mono font-bold ${activeTwin.vm.cpuUsage > 80 ? 'text-rose-400' : 'text-slate-100'}`}>
                      {activeTwin.vm.cpuUsage}%
                    </strong>
                    <span className="text-[10px] font-mono text-slate-500 block mt-1">Load: {activeTwin.loadAverage}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">RAM Allocated</span>
                    <strong className="text-xl font-mono font-bold text-slate-100">{activeTwin.vm.ramGb} GB / {activeTwin.vm.ramTotalGb || 64} GB</strong>
                    <span className="text-[10px] font-mono text-slate-500 block mt-1">Buffer: Normal</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Disk Storage</span>
                    <strong className="text-xl font-mono font-bold text-slate-100">{activeTwin.storageUsedGb} GB / {activeTwin.storageTotalGb} GB</strong>
                    <span className="text-[10px] font-mono text-slate-500 block mt-1">IOPS: {activeTwin.readIops} R / {activeTwin.writeIops} W</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Network Rate</span>
                    <strong className="text-xl font-mono font-bold text-cyan-400">{activeTwin.vm.networkMbps} Mbps</strong>
                    <span className="text-[10px] font-mono text-slate-500 block mt-1">Latency: {activeTwin.latencyMs} ms</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Uptime & Workloads</span>
                    <strong className="text-xl font-mono font-bold text-slate-100">{activeTwin.vm.uptimeHours} hrs</strong>
                    <span className="text-[10px] font-mono text-slate-500 block mt-1">Containers: {activeTwin.vm.hostedContainers.length}</span>
                  </div>
                </div>

                {/* Host & Workload Relationship Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Physical Host Card */}
                  <div className="p-4 rounded-2xl bg-[#0D121A] border border-[#1E2936] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#1E2936] pb-2">
                      <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                        <Server size={16} className="text-purple-400" /> HOST SERVER PHYSICAL TWIN
                      </span>
                      <button
                        onClick={() => navigate(`/servers?inspect=${activeTwin.vm.hostServerId}`)}
                        className="text-xs font-mono text-purple-400 hover:underline flex items-center gap-1"
                      >
                        [View Host] <ExternalLink size={12} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <div>
                        <h4 className="font-bold text-slate-100">{activeTwin.vm.hostServerId}</h4>
                        <p className="text-[#A7B0BC]">Hypervisor Host Node</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        ● HOST ONLINE
                      </span>
                    </div>
                  </div>

                  {/* Hosted Containers Summary */}
                  <div className="p-4 rounded-2xl bg-[#0D121A] border border-[#1E2936] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#1E2936] pb-2">
                      <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                        <Layers size={16} className="text-cyan-400" /> HOSTED WORKLOADS ({activeTwin.vm.hostedContainers.length})
                      </span>
                      <button
                        onClick={() => navigate(`/containers?vm=${activeTwin.vm.id}`)}
                        className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        [View Workloads] <ExternalLink size={12} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                      {activeTwin.vm.hostedContainers.map((c) => (
                        <span key={c} className="px-2.5 py-1 rounded-lg bg-[#111923] text-cyan-300 border border-[#1E2936]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TELEMETRY TAB */}
            {activeTab === 'TELEMETRY' && (
              <div className="space-y-4 bg-[#0D121A] border border-[#1E2936] p-4 rounded-2xl">
                <div className="flex items-center justify-between border-b border-[#1E2936] pb-3">
                  <h3 className="text-xs font-mono font-bold text-slate-200 flex items-center gap-2">
                    <Activity size={16} className="text-purple-400" /> LIVE & HISTORICAL VM TELEMETRY METRICS
                  </h3>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {(['5m', '30m', '1h', '6h', '24h', '7d'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTelemetryTimeframe(t)}
                        className={`px-2.5 py-1 rounded-lg border font-bold ${
                          telemetryTimeframe === t
                            ? 'bg-purple-600 text-white border-purple-500'
                            : 'bg-[#111923] text-slate-400 border-[#1E2936] hover:text-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">CPU Utilization</span>
                    <strong className="text-lg font-bold text-slate-100">{activeTwin.vm.cpuUsage}%</strong>
                    <span className="text-[10px] text-purple-400 block mt-1">Source: {activeTwin.vm.source}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">Memory Utilization</span>
                    <strong className="text-lg font-bold text-slate-100">{activeTwin.vm.ramGb} GB / {activeTwin.vm.ramTotalGb || 64} GB</strong>
                    <span className="text-[10px] text-slate-400 block mt-1">Freshness: {activeTwin.vm.lastUpdateSecAgo}s</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">Network Throughput</span>
                    <strong className="text-lg font-bold text-cyan-400">{activeTwin.vm.networkMbps} Mbps</strong>
                    <span className="text-[10px] text-slate-400 block mt-1">Packets: {activeTwin.networkPackets}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">Disk IOPS</span>
                    <strong className="text-lg font-bold text-slate-100">{activeTwin.readIops} Read / {activeTwin.writeIops} Write</strong>
                    <span className="text-[10px] text-slate-400 block mt-1">Disk Latency: {activeTwin.diskLatencyMs} ms</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">Load Average</span>
                    <strong className="text-lg font-bold text-slate-100">{activeTwin.loadAverage}</strong>
                    <span className="text-[10px] text-slate-400 block mt-1">1m, 5m, 15m</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">Process Count</span>
                    <strong className="text-lg font-bold text-slate-100">{activeTwin.processCount} Threads</strong>
                    <span className="text-[10px] text-slate-400 block mt-1">Active PIDs</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. WORKLOADS TAB */}
            {activeTab === 'WORKLOADS' && (
              <div className="bg-[#0D121A] border border-[#1E2936] p-4 rounded-2xl space-y-3 font-mono text-xs">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Layers size={16} className="text-cyan-400" /> HOSTED CONTAINERS & POD WORKLOADS
                </h3>

                <div className="space-y-2">
                  {activeTwin.vm.hostedContainers.map((pod) => (
                    <div key={pod} className="p-3 rounded-xl bg-[#111923] border border-[#1E2936] flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-cyan-300">{pod}</h4>
                        <p className="text-[10px] text-slate-500">Container Pod • Namespace: irisyn</p>
                      </div>
                      <button
                        onClick={() => navigate(`/containers?inspect=${pod}`)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600 border border-cyan-500/30 transition-colors text-xs font-bold flex items-center gap-1"
                      >
                        Inspect Pod <ExternalLink size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. NETWORK TAB */}
            {activeTab === 'NETWORK' && (
              <div className="bg-[#0D121A] border border-[#1E2936] p-4 rounded-2xl space-y-4 font-mono text-xs">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Network size={16} className="text-purple-400" /> VIRTUAL NETWORK INTERFACE & HEALTH
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">IP Address</span>
                    <strong className="text-slate-100">{activeTwin.ipAddress}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">MAC Address</span>
                    <strong className="text-slate-100">{activeTwin.macAddress}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">Interface</span>
                    <strong className="text-cyan-400">{activeTwin.interfaceName}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">Virtual Switch</span>
                    <strong className="text-purple-300">{activeTwin.virtualSwitch}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* 5. STORAGE TAB */}
            {activeTab === 'STORAGE' && (
              <div className="bg-[#0D121A] border border-[#1E2936] p-4 rounded-2xl space-y-4 font-mono text-xs">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <HardDrive size={16} className="text-amber-400" /> STORAGE & DISK IOPS SUBSYSTEM
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">Root Volume Capacity</span>
                    <strong className="text-slate-100">{activeTwin.storageUsedGb} GB / {activeTwin.storageTotalGb} GB</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">Read / Write IOPS</span>
                    <strong className="text-slate-100">{activeTwin.readIops} R / {activeTwin.writeIops} W</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">Disk Latency</span>
                    <strong className={activeTwin.diskLatencyMs > 10 ? 'text-amber-400' : 'text-slate-100'}>
                      {activeTwin.diskLatencyMs} ms
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* 6. PROCESSES TAB */}
            {activeTab === 'PROCESSES' && (
              <div className="bg-[#0D121A] border border-[#1E2936] p-4 rounded-2xl space-y-3 font-mono text-xs">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Sliders size={16} className="text-purple-400" /> TOP RESOURCE PROCESS MONITOR
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#1E2936] text-[10px] text-slate-500 uppercase">
                        <th className="py-2 px-3">Process</th>
                        <th className="py-2 px-3">PID</th>
                        <th className="py-2 px-3">CPU</th>
                        <th className="py-2 px-3">RAM</th>
                        <th className="py-2 px-3">State</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2936]">
                      {activeTwin.topProcesses.map((proc) => (
                        <tr key={proc.pid} className="hover:bg-[#111923]">
                          <td className="py-2 px-3 font-bold text-slate-100">{proc.name}</td>
                          <td className="py-2 px-3 text-slate-400">{proc.pid}</td>
                          <td className="py-2 px-3 font-bold text-rose-400">{proc.cpuPct}%</td>
                          <td className="py-2 px-3 text-slate-300">{proc.ramGb} GB</td>
                          <td className="py-2 px-3 text-emerald-400 font-bold">● {proc.state}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={handleInvestigate}
                              className="px-2 py-1 rounded bg-purple-600/20 text-purple-300 hover:bg-purple-600 border border-purple-500/30 text-[10px] font-bold"
                            >
                              Investigate Process
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 7. LOGS TAB */}
            {activeTab === 'LOGS' && (
              <div className="bg-[#0D121A] border border-[#1E2936] p-4 rounded-2xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#1E2936] pb-3">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Terminal size={16} className="text-cyan-400" /> VM SYSTEM & APPLICATION LOGS STREAM
                  </h3>
                  <div className="flex items-center gap-1 text-[11px]">
                    {(['ALL', 'ERROR', 'WARNING', 'INFO'] as const).map((sev) => (
                      <button
                        key={sev}
                        onClick={() => setLogSeverityFilter(sev)}
                        className={`px-2.5 py-1 rounded border font-bold ${
                          logSeverityFilter === sev ? 'bg-purple-600 text-white border-purple-500' : 'bg-[#111923] text-slate-400 border-[#1E2936]'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  {activeTwin.logs
                    .filter((l) => logSeverityFilter === 'ALL' || l.severity === logSeverityFilter)
                    .map((log) => (
                      <div key={log.id} className="p-2.5 rounded-lg bg-[#111923] border border-[#1E2936] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                              log.severity === 'ERROR'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : log.severity === 'WARNING'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {log.severity}
                          </span>
                          <strong className="text-purple-300">[{log.source}]</strong>
                          <span className="text-slate-200">{log.message}</span>
                        </div>
                        {log.severity === 'ERROR' && (
                          <button
                            onClick={handleInvestigate}
                            className="px-2 py-0.5 rounded bg-rose-600/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold"
                          >
                            Investigate Error
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 8. HEALTH TAB */}
            {activeTab === 'HEALTH' && (
              <div className="bg-[#0D121A] border border-[#1E2936] p-4 rounded-2xl space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#1E2936] pb-3">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Activity size={16} className="text-emerald-400" /> EXPLAINABLE HEALTH CONTRIBUTORS
                  </h3>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    OVERALL HEALTH: {activeTwin.healthScore}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {activeTwin.healthContributors.map((hc) => (
                    <div key={hc.name} className="p-3 rounded-xl bg-[#111923] border border-[#1E2936] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-bold">{hc.name}</span>
                        <strong className={hc.score < 80 ? 'text-amber-400' : 'text-emerald-400'}>+{hc.score}</strong>
                      </div>
                      <p className="text-[10px] text-slate-500">{hc.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. ANOMALIES TAB */}
            {activeTab === 'ANOMALIES' && (
              <div className="bg-[#0D121A] border border-[#1E2936] p-4 rounded-2xl space-y-3 font-mono text-xs">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-400" /> ACTIVE VM METRIC ANOMALIES
                </h3>

                {activeTwin.anomalies.length === 0 ? (
                  <p className="text-slate-500 italic p-4 text-center">No active anomalies detected on this VM.</p>
                ) : (
                  <div className="space-y-2">
                    {activeTwin.anomalies.map((anom) => (
                      <div key={anom.id} className="p-3.5 rounded-xl bg-[#111923] border border-rose-500/30 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-rose-400">{anom.metric}</h4>
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {anom.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{anom.description}</p>
                          <div className="text-[10px] text-slate-400 mt-1 flex gap-3">
                            <span>Observed: <strong>{anom.observed}</strong></span>
                            <span>Baseline: <strong>{anom.baseline}</strong></span>
                            <span>Deviation: <strong className="text-rose-400">{anom.deviation}</strong></span>
                          </div>
                        </div>
                        <button
                          onClick={handleInvestigate}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs"
                        >
                          Investigate
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 10. ALERTS TAB */}
            {activeTab === 'ALERTS' && (
              <div className="bg-[#0D121A] border border-[#1E2936] p-4 rounded-2xl space-y-3 font-mono text-xs">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-400" /> ACTIVE VM ALERTS
                </h3>

                {activeTwin.alerts.length === 0 ? (
                  <p className="text-slate-500 italic p-4 text-center">No active alerts for this VM.</p>
                ) : (
                  <div className="space-y-2">
                    {activeTwin.alerts.map((alt) => (
                      <div key={alt.id} className="p-3 rounded-xl bg-[#111923] border border-amber-500/30 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-amber-400">{alt.id} • {alt.metric}</span>
                          <p className="text-slate-300 text-xs mt-0.5">Observed {alt.observed} exceeding threshold {alt.threshold} for {alt.duration}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleInvestigate} className="px-3 py-1 rounded bg-purple-600 text-white text-xs font-bold">
                            Investigate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 11. INCIDENTS TAB */}
            {activeTab === 'INCIDENTS' && (
              <div className="bg-[#0D121A] border border-[#1E2936] p-4 rounded-2xl space-y-3 font-mono text-xs">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-400" /> OPEN INCIDENTS
                </h3>

                {activeTwin.incidents.length === 0 ? (
                  <p className="text-slate-500 italic p-4 text-center">No open incidents reported for this VM.</p>
                ) : (
                  <div className="space-y-2">
                    {activeTwin.incidents.map((inc) => (
                      <div key={inc.id} className="p-3 rounded-xl bg-[#111923] border border-rose-500/30 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-rose-400">{inc.id} • {inc.title}</span>
                          <p className="text-slate-400 text-xs mt-0.5">Started at {inc.startedAt} • Status: {inc.status}</p>
                        </div>
                        <button onClick={() => navigate('/incidents')} className="px-3 py-1 rounded bg-purple-600 text-white text-xs font-bold">
                          Open Incident
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 12. PREDICTIONS TAB */}
            {activeTab === 'PREDICTIONS' && (
              <div className="bg-[#0D121A] border border-[#1E2936] p-4 rounded-2xl space-y-3 font-mono text-xs">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-400" /> PREDICTIVE FAILURE & RESOURCE RISK
                </h3>

                <div className="p-4 rounded-xl bg-[#111923] border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-100 text-sm">{activeTwin.predictiveRisk.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                      Model: {activeTwin.predictiveRisk.model}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-[#0D121A] border border-[#1E2936]">
                      <span className="text-slate-500 text-[10px] block">Risk Score</span>
                      <strong className="text-rose-400 text-base">{activeTwin.predictiveRisk.riskPct}%</strong>
                    </div>
                    <div className="p-2 rounded bg-[#0D121A] border border-[#1E2936]">
                      <span className="text-slate-500 text-[10px] block">Confidence</span>
                      <strong className="text-purple-300 text-base">{activeTwin.predictiveRisk.confidencePct}%</strong>
                    </div>
                    <div className="p-2 rounded bg-[#0D121A] border border-[#1E2936]">
                      <span className="text-slate-500 text-[10px] block">Time Horizon</span>
                      <strong className="text-slate-100 text-base">{activeTwin.predictiveRisk.horizon}</strong>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Predictive Evidence Factors:</span>
                    {activeTwin.predictiveRisk.evidence.map((ev, i) => (
                      <p key={i} className="text-xs text-slate-300 font-sans">• {ev}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 13. MAINTENANCE TAB */}
            {activeTab === 'MAINTENANCE' && (
              <div className="bg-[#0D121A] border border-[#1E2936] p-4 rounded-2xl space-y-3 font-mono text-xs">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Wrench size={16} className="text-amber-400" /> VM MAINTENANCE & WORK ORDERS
                </h3>

                <div className="space-y-2">
                  {activeTwin.maintenanceTasks.map((task) => (
                    <div key={task.task} className="p-3 rounded-xl bg-[#111923] border border-[#1E2936] flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-100">{task.task}</h4>
                        <p className="text-slate-400 text-xs mt-0.5">Reason: {task.reason} • Due: {task.due}</p>
                      </div>
                      <button onClick={() => navigate('/maintenance')} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs">
                        Open Work Order
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 14. CONFIGURATION TAB */}
            {activeTab === 'CONFIGURATION' && (
              <div className="bg-[#0D121A] border border-[#1E2936] p-4 rounded-2xl space-y-4 font-mono text-xs">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Sliders size={16} className="text-purple-400" /> VIRTUAL MACHINE HARDWARE CONFIGURATION & HISTORY
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">vCPU Allocation</span>
                    <strong className="text-slate-100">{activeTwin.configuration.vcpu} Cores</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">RAM Memory</span>
                    <strong className="text-slate-100">{activeTwin.configuration.ramGb} GB</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">Operating System</span>
                    <strong className="text-slate-100">{activeTwin.configuration.os}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">Kernel Version</span>
                    <strong className="text-slate-100">{activeTwin.configuration.kernel}</strong>
                  </div>
                </div>

                <div className="space-y-2 border-t border-[#1E2936] pt-3">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Auditable Configuration Change History</span>
                  {activeTwin.configHistory.map((ch, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#111923] border border-[#1E2936] flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-purple-300">{ch.change}</strong>
                        <p className="text-[10px] text-slate-400 mt-0.5">By {ch.user} • Reason: {ch.reason}</p>
                      </div>
                      <span className="text-slate-500 text-[10px]">{ch.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 15. SECURITY TAB */}
            {activeTab === 'SECURITY' && (
              <div className="bg-[#0D121A] border border-[#1E2936] p-4 rounded-2xl space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#1E2936] pb-3">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-400" /> SECURITY & COMPLIANCE POSTURE
                  </h3>
                  <button onClick={() => navigate('/security')} className="px-3 py-1 rounded bg-purple-600 text-white font-bold text-xs">
                    Open Security Workspace
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">Auth State</span>
                    <strong className="text-emerald-400">{activeTwin.securityPosture.authState}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">Security Violations</span>
                    <strong className="text-slate-100">{activeTwin.securityPosture.securityEvents}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">Open Network Ports</span>
                    <strong className="text-purple-300">{activeTwin.securityPosture.openPorts.join(', ')}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                    <span className="text-[10px] text-slate-500 uppercase block">Config Drift</span>
                    <strong className="text-slate-100">{activeTwin.securityPosture.configDrift}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* 16. TIMELINE TAB */}
            {activeTab === 'TIMELINE' && (
              <div className="bg-[#0D121A] border border-[#1E2936] p-4 rounded-2xl space-y-4 font-mono text-xs">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Clock size={16} className="text-purple-400" /> DIGITAL TWIN EVENT TIMELINE & DATA LINEAGE
                </h3>

                <div className="space-y-2 border-l-2 border-purple-500/30 pl-4">
                  {activeTwin.eventTimeline.map((ev, i) => (
                    <div key={i} className="relative space-y-0.5">
                      <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-purple-500 ring-4 ring-[#0D121A]" />
                      <span className="text-[10px] font-mono text-purple-400 font-bold">{ev.time} • [{ev.type}]</span>
                      <p className="text-xs text-slate-200 font-sans">{ev.event}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#1E2936] space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">OPERATIONAL DATA LINEAGE</span>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-300 bg-[#111923] p-3 rounded-xl border border-[#1E2936]">
                    {activeTwin.dataLineage.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#0D121A] border border-[#1E2936] text-purple-300 font-bold">
                          {step}
                        </span>
                        {idx < activeTwin.dataLineage.length - 1 && <span className="text-purple-500 font-bold">→</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* MODE B: VIRTUAL MACHINE DIRECTORY VIEW                   */
          /* ======================================================== */
          <div className="space-y-6">
            {/* Top Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-[#0D121A] border border-[#1E2936] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">TOTAL VMs</p>
                  <h3 className="text-2xl font-mono font-black text-slate-100 mt-1">{totalCount}</h3>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Box size={20} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0D121A] border border-[#1E2936] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">RUNNING</p>
                  <h3 className="text-2xl font-mono font-black text-emerald-400 mt-1">{runningCount}</h3>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={20} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0D121A] border border-[#1E2936] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">WARNING</p>
                  <h3 className="text-2xl font-mono font-black text-amber-400 mt-1">{warningCount}</h3>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertTriangle size={20} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0D121A] border border-[#1E2936] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">CRITICAL</p>
                  <h3 className="text-2xl font-mono font-black text-rose-400 mt-1">{criticalCount}</h3>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertCircle size={20} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0D121A] border border-[#1E2936] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">OFFLINE</p>
                  <h3 className="text-2xl font-mono font-black text-slate-500 mt-1">{offlineCount}</h3>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-500/10 text-slate-500 border border-slate-500/20">
                  <X size={20} />
                </div>
              </div>
            </div>

            {/* Directory Filters Row */}
            <div className="p-3.5 rounded-2xl bg-[#0D121A] border border-[#1E2936] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                <Search size={15} className="text-purple-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search VM ID or Name (e.g. vm-k8s-worker-01)..."
                  className="w-full bg-[#111923] border border-[#1E2936] rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <div className="flex items-center gap-1.5 bg-[#111923] px-2.5 py-1.5 rounded-xl border border-[#1E2936]">
                  <span className="text-slate-400 text-[11px]">Host:</span>
                  <select
                    value={hostFilter}
                    onChange={(e) => setHostFilter(e.target.value)}
                    className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs font-bold"
                  >
                    <option value="All" className="bg-[#111923]">All</option>
                    {hostServers.map((h) => (
                      <option key={h} value={h} className="bg-[#111923]">{h}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-[#111923] px-2.5 py-1.5 rounded-xl border border-[#1E2936]">
                  <span className="text-slate-400 text-[11px]">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs font-bold"
                  >
                    <option value="All" className="bg-[#111923]">All</option>
                    <option value="HEALTHY" className="bg-[#111923]">Healthy</option>
                    <option value="WARNING" className="bg-[#111923]">Warning</option>
                    <option value="CRITICAL" className="bg-[#111923]">Critical</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Virtual Machines Directory Table */}
            <div className="bg-[#0D121A] border border-[#1E2936] rounded-2xl overflow-hidden shadow-lg">
              {filteredVms.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <Box size={32} className="mx-auto text-slate-600" />
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">NO VIRTUAL MACHINES FOUND</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No virtual machines are currently registered matching your filter criteria.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="bg-[#111923] border-b border-[#1E2936] text-slate-400 text-[11px] uppercase tracking-wider font-extrabold">
                        <th className="py-3 px-4">VM ID / NAME</th>
                        <th className="py-3 px-4">HOST SERVER</th>
                        <th className="py-3 px-4">CLUSTER</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4">HEALTH</th>
                        <th className="py-3 px-4">CPU</th>
                        <th className="py-3 px-4">RAM</th>
                        <th className="py-3 px-4">WORKLOADS</th>
                        <th className="py-3 px-4">SOURCE</th>
                        <th className="py-3 px-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2936]/60">
                      {filteredVms.map((vm) => {
                        const isCritical = vm.status === 'CRITICAL';
                        const isWarning = vm.status === 'WARNING';
                        const health = vm.healthScore || (isCritical ? 61 : isWarning ? 78 : 92);

                        let badgeStyle = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
                        if (isCritical) badgeStyle = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
                        else if (isWarning) badgeStyle = 'bg-amber-500/15 text-amber-400 border-amber-500/30';

                        return (
                          <tr
                            key={vm.id}
                            onClick={() => handleSelectVm(vm.id)}
                            className="hover:bg-[#16212e] transition-colors cursor-pointer group"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Box size={15} className="text-purple-400 shrink-0" />
                                <div>
                                  <span className="font-bold text-slate-100 group-hover:text-purple-300 block leading-none">
                                    {vm.id}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block mt-0.5">{vm.name}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/servers?inspect=${vm.hostServerId}`);
                                }}
                                className="px-2 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                              >
                                <Server size={11} />
                                {vm.hostServerId}
                              </button>
                            </td>

                            <td className="py-3 px-4 text-slate-300 font-bold">
                              {vm.cluster || 'IRISYN-CLUSTER-01'}
                            </td>

                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border inline-flex items-center gap-1 ${badgeStyle}`}>
                                ● {vm.status}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`font-extrabold ${health < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {health}%
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className={vm.cpuUsage > 80 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                                {vm.cpuUsage}%
                              </span>
                            </td>

                            <td className="py-3 px-4 text-slate-300">
                              {vm.ramGb} GB
                            </td>

                            <td className="py-3 px-4 text-cyan-300 font-bold">
                              {vm.hostedContainers.length} Pods
                            </td>

                            <td className="py-3 px-4 text-slate-400 text-[10px]">
                              {vm.source}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectVm(vm.id);
                                }}
                                className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-purple-600/20 hover:bg-purple-600 text-purple-300 border border-purple-500/30 hover:border-purple-500 transition-all flex items-center gap-1 ml-auto"
                              >
                                View Twin <ExternalLink size={11} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Copilot Drawer */}
      <CopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </DashboardLayout>
  );
};

export default VirtualMachines;
