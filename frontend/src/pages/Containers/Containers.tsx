import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import InfrastructureHierarchyNav from '@/components/infrastructure/InfrastructureHierarchyNav';
import InfrastructureStatusStrip from '@/components/infrastructure/InfrastructureStatusStrip';
import CopilotDrawer from '@/components/copilot/CopilotDrawer';
import { MOCK_PODS, ContainerPodItem } from '@/services/infrastructureData';
import {
  Layers,
  Search,
  Box,
  Bot,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  ExternalLink,
  Terminal,
  Network,
  Stethoscope,
} from 'lucide-react';

const Containers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialInspect = searchParams.get('inspect') || searchParams.get('pod');
  const initialVm = searchParams.get('vm');

  const [searchQuery, setSearchQuery] = useState('');
  const [clusterFilter, setClusterFilter] = useState<string>('All');
  const [namespaceFilter, setNamespaceFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'RUNNING' | 'WARNING' | 'FAILED' | 'PENDING'>('All');
  const [selectedPod, setSelectedPod] = useState<ContainerPodItem | null>(() => {
    if (initialInspect) {
      return MOCK_PODS.find((p) => p.id === initialInspect || p.name === initialInspect || p.podName === initialInspect) || null;
    }
    return null;
  });

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Available Clusters and Namespaces
  const clusters = Array.from(new Set(MOCK_PODS.map((p) => p.cluster)));
  const namespaces = Array.from(new Set(MOCK_PODS.map((p) => p.namespace)));

  // Filtered Pods
  const filteredPods = useMemo(() => {
    return MOCK_PODS.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.podName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.hostVmId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVm = !initialVm || p.hostVmId === initialVm;
      const matchesCluster = clusterFilter === 'All' || p.cluster === clusterFilter;
      const matchesNamespace = namespaceFilter === 'All' || p.namespace === namespaceFilter;
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesVm && matchesCluster && matchesNamespace && matchesStatus;
    });
  }, [searchQuery, initialVm, clusterFilter, namespaceFilter, statusFilter]);

  const totalCount = MOCK_PODS.length;
  const runningCount = MOCK_PODS.filter((p) => p.status === 'RUNNING').length;
  const warningCount = MOCK_PODS.filter((p) => p.status === 'WARNING').length;
  const failedCount = MOCK_PODS.filter((p) => p.status === 'FAILED').length;

  const handleInvestigate = (_pod: ContainerPodItem) => {
    setIsCopilotOpen(true);
  };

  return (
    <DashboardLayout
      title="Containers & Pods"
      description="Running applications, workloads and service health."
    >
      <div className="space-y-6">
        {/* Hierarchy Banner */}
        <InfrastructureHierarchyNav />

        {/* Common Status Strip */}
        <InfrastructureStatusStrip />

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#0D121A] border border-[#1E2936] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">TOTAL PODS</p>
              <h3 className="text-2xl font-mono font-black text-slate-100 mt-1">{totalCount}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Layers size={20} />
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
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">FAILED</p>
              <h3 className="text-2xl font-mono font-black text-rose-400 mt-1">{failedCount}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertCircle size={20} />
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="p-3.5 rounded-2xl bg-[#0D121A] border border-[#1E2936] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Search size={15} className="text-purple-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workload (e.g. legacy-api)..."
              className="w-full bg-[#111923] border border-[#1E2936] rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 bg-[#111923] px-2.5 py-1.5 rounded-xl border border-[#1E2936]">
              <span className="text-slate-400 text-[11px]">Cluster:</span>
              <select
                value={clusterFilter}
                onChange={(e) => setClusterFilter(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs font-bold"
              >
                <option value="All" className="bg-[#111923]">All</option>
                {clusters.map((c) => (
                  <option key={c} value={c} className="bg-[#111923]">{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#111923] px-2.5 py-1.5 rounded-xl border border-[#1E2936]">
              <span className="text-slate-400 text-[11px]">Namespace:</span>
              <select
                value={namespaceFilter}
                onChange={(e) => setNamespaceFilter(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs font-bold"
              >
                <option value="All" className="bg-[#111923]">All</option>
                {namespaces.map((ns) => (
                  <option key={ns} value={ns} className="bg-[#111923]">{ns}</option>
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
                <option value="RUNNING" className="bg-[#111923]">Running</option>
                <option value="WARNING" className="bg-[#111923]">Warning</option>
                <option value="FAILED" className="bg-[#111923]">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Workload Data Table */}
        <div className="bg-[#0D121A] border border-[#1E2936] rounded-2xl overflow-hidden shadow-lg">
          {filteredPods.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Layers size={32} className="mx-auto text-slate-600" />
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">NO RUNNING WORKLOADS</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No containers or pods are currently reporting matching your search parameters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-[#111923] border-b border-[#1E2936] text-slate-400 text-[11px] uppercase tracking-wider font-extrabold">
                    <th className="py-3 px-4">WORKLOAD</th>
                    <th className="py-3 px-4">HOST / VM</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4">CPU</th>
                    <th className="py-3 px-4">RAM</th>
                    <th className="py-3 px-4">RESTARTS</th>
                    <th className="py-3 px-4 text-right">AGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2936]/60">
                  {filteredPods.map((pod) => {
                    const isFailed = pod.status === 'FAILED';
                    const isWarning = pod.status === 'WARNING';

                    let badgeStyle = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
                    if (isFailed) badgeStyle = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
                    else if (isWarning) badgeStyle = 'bg-amber-500/15 text-amber-400 border-amber-500/30';

                    return (
                      <tr
                        key={pod.id}
                        onClick={() => setSelectedPod(pod)}
                        className="hover:bg-[#16212e] transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4 font-bold text-slate-100 group-hover:text-cyan-300 flex items-center gap-2">
                          <Layers size={14} className="text-cyan-400 shrink-0" />
                          <div>
                            <span>{pod.name}</span>
                            <span className="text-[10px] text-slate-500 block font-normal">{pod.namespace}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/virtual-machines?inspect=${pod.hostVmId}`);
                            }}
                            className="px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                          >
                            <Box size={12} />
                            {pod.hostVmId}
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border inline-flex items-center gap-1 ${badgeStyle}`}>
                            ● {pod.status}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className={pod.cpuUsage > 75 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                            {pod.cpuUsage}%
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-300">
                          {pod.ramDisplay}
                        </td>

                        <td className="py-3 px-4">
                          <span className={pod.restarts > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                            {pod.restarts}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right text-slate-500">
                          {pod.age}
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

      {/* CONTAINER / POD DETAIL DRAWER */}
      {selectedPod && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#0D121A] border-l border-[#1E2936] text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-250 font-sans">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#1E2936] flex items-center justify-between bg-[#070A0F]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="font-mono font-bold text-sm text-slate-100">{selectedPod.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">Namespace: {selectedPod.namespace}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPod(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#111923]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
              {/* Status Banner */}
              <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">WORKLOAD STATUS</span>
                  <span className={`font-bold flex items-center gap-1.5 mt-0.5 ${
                    selectedPod.status === 'FAILED' ? 'text-rose-400' : selectedPod.status === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    ● {selectedPod.status}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {selectedPod.source}
                </span>
              </div>

              {/* Problem Callout Box */}
              {selectedPod.problem && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-200 space-y-1.5 font-sans">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-rose-400">
                    <AlertCircle size={15} /> Issue Identified: {selectedPod.problem}
                  </div>
                  <p className="text-xs text-slate-300"><strong>Impact:</strong> {selectedPod.impact}</p>
                  <p className="text-xs text-amber-300 font-mono"><strong>Recommended:</strong> {selectedPod.recommendedAction}</p>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                  <span className="text-slate-500 text-[10px] block uppercase">CPU Usage</span>
                  <strong className={`text-base font-bold ${selectedPod.cpuUsage > 75 ? 'text-rose-400' : 'text-slate-100'}`}>{selectedPod.cpuUsage}%</strong>
                </div>

                <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                  <span className="text-slate-500 text-[10px] block uppercase">Memory</span>
                  <strong className="text-base font-bold text-slate-100">{selectedPod.ramDisplay}</strong>
                </div>

                <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                  <span className="text-slate-500 text-[10px] block uppercase">Restart Count</span>
                  <strong className={`text-base font-bold ${selectedPod.restarts > 0 ? 'text-rose-400' : 'text-slate-100'}`}>{selectedPod.restarts}</strong>
                </div>

                <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                  <span className="text-slate-500 text-[10px] block uppercase">Uptime Age</span>
                  <strong className="text-base font-bold text-slate-100">{selectedPod.age}</strong>
                </div>
              </div>

              {/* Host VM Link Box */}
              <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936] space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">HOST VIRTUAL MACHINE</span>
                <button
                  onClick={() => { setSelectedPod(null); navigate(`/virtual-machines?inspect=${selectedPod.hostVmId}`); }}
                  className="w-full p-2.5 rounded-lg bg-[#0D121A] hover:bg-slate-800 border border-[#1E2936] text-left text-xs font-mono text-purple-300 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2 font-bold">
                    <Box size={14} className="text-purple-400" /> {selectedPod.hostVmId}
                  </span>
                  <ExternalLink size={12} className="text-slate-500" />
                </button>
              </div>

              {/* Connected Services */}
              <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Network size={14} className="text-cyan-400" /> Connected Services ({selectedPod.connectedServices.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPod.connectedServices.map((service) => (
                    <span
                      key={service}
                      className="px-2.5 py-1 rounded-lg bg-[#0D121A] text-slate-300 border border-[#1E2936] text-[11px] font-mono font-semibold"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Actions Footer */}
            <div className="p-3 border-t border-[#1E2936] bg-[#070A0F] space-y-2">
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  onClick={() => navigate(`/logs?pod=${selectedPod.name}`)}
                  className="p-2 rounded-xl bg-[#111923] hover:bg-slate-800 border border-[#1E2936] text-slate-300 font-bold text-center flex items-center justify-center gap-1.5"
                >
                  <Terminal size={14} /> View Logs
                </button>
                <button
                  onClick={() => navigate(`/virtual-machines?inspect=${selectedPod.hostVmId}`)}
                  className="p-2 rounded-xl bg-[#111923] hover:bg-slate-800 border border-[#1E2936] text-purple-300 font-bold text-center"
                >
                  View Host
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  onClick={() => navigate(`/diagnostics?pod=${selectedPod.name}`)}
                  className="p-2 rounded-xl bg-[#111923] hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-bold text-center flex items-center justify-center gap-1.5"
                >
                  <Stethoscope size={14} /> Diagnostics
                </button>
                <button
                  onClick={() => handleInvestigate(selectedPod)}
                  className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-center flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20"
                >
                  <Bot size={14} /> Investigate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Copilot Drawer */}
      <CopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </DashboardLayout>
  );
};

export default Containers;
