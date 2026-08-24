import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import InfrastructureHierarchyNav from '@/components/infrastructure/InfrastructureHierarchyNav';
import InfrastructureStatusStrip from '@/components/infrastructure/InfrastructureStatusStrip';
import CopilotDrawer from '@/components/copilot/CopilotDrawer';
import { MOCK_SERVERS, ServerNode } from '@/services/infrastructureData';
import {
  Server,
  Search,
  ArrowUpDown,
  Box,
  Layers,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
  Bot,
} from 'lucide-react';

const Servers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialInspect = searchParams.get('inspect') || searchParams.get('host');

  const [searchQuery, setSearchQuery] = useState('');
  const [rackFilter, setRackFilter] = useState<'All' | 'Rack A' | 'Rack B' | 'Rack C'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE'>('All');
  const [sortBy, setSortBy] = useState<'Health' | 'Name' | 'CPU' | 'RAM'>('Health');
  const [inspectServer, setInspectServer] = useState<ServerNode | null>(() => {
    if (initialInspect) {
      return MOCK_SERVERS.find((s) => s.id === initialInspect || s.hostname === initialInspect) || null;
    }
    return null;
  });

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Filtered & sorted servers
  const filteredServers = useMemo(() => {
    return MOCK_SERVERS.filter((s) => {
      const matchesSearch =
        s.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rack.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRack = rackFilter === 'All' || s.rack === rackFilter;
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesRack && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'Name') return a.hostname.localeCompare(b.hostname);
      if (sortBy === 'CPU') return b.cpuUsage - a.cpuUsage;
      if (sortBy === 'RAM') return b.ramUsage - a.ramUsage;
      // Health sort: CRITICAL first, then WARNING, then OFFLINE, then HEALTHY
      const rank = { CRITICAL: 0, WARNING: 1, OFFLINE: 2, HEALTHY: 3 };
      return rank[a.status] - rank[b.status];
    });
  }, [searchQuery, rackFilter, statusFilter, sortBy]);

  // Group servers by rack
  const racks = ['Rack A', 'Rack B', 'Rack C'] as const;

  const totalCount = MOCK_SERVERS.length;
  const onlineCount = MOCK_SERVERS.filter((s) => s.status !== 'OFFLINE').length;
  const warningCount = MOCK_SERVERS.filter((s) => s.status === 'WARNING').length;
  const criticalCount = MOCK_SERVERS.filter((s) => s.status === 'CRITICAL').length;

  const handleInvestigate = (_server: ServerNode) => {
    setIsCopilotOpen(true);
  };

  return (
    <DashboardLayout
      title="Servers & Racks"
      description="Physical infrastructure, rack layout and live server health."
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
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">TOTAL SERVERS</p>
              <h3 className="text-2xl font-mono font-black text-slate-100 mt-1">{totalCount}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Server size={20} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D121A] border border-[#1E2936] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">ONLINE</p>
              <h3 className="text-2xl font-mono font-black text-emerald-400 mt-1">{onlineCount}</h3>
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
        </div>

        {/* Compact Filter Row */}
        <div className="p-3.5 rounded-2xl bg-[#0D121A] border border-[#1E2936] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Search size={15} className="text-purple-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search server node (e.g. dc-node-03)..."
              className="w-full bg-[#111923] border border-[#1E2936] rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 bg-[#111923] px-2.5 py-1.5 rounded-xl border border-[#1E2936]">
              <span className="text-slate-400 text-[11px]">Rack:</span>
              <select
                value={rackFilter}
                onChange={(e) => setRackFilter(e.target.value as any)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs font-bold"
              >
                <option value="All" className="bg-[#111923]">All</option>
                <option value="Rack A" className="bg-[#111923]">Rack A</option>
                <option value="Rack B" className="bg-[#111923]">Rack B</option>
                <option value="Rack C" className="bg-[#111923]">Rack C</option>
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
                <option value="OFFLINE" className="bg-[#111923]">Offline</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#111923] px-2.5 py-1.5 rounded-xl border border-[#1E2936]">
              <ArrowUpDown size={13} className="text-purple-400" />
              <span className="text-slate-400 text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs font-bold"
              >
                <option value="Health" className="bg-[#111923]">Health Priority</option>
                <option value="Name" className="bg-[#111923]">Name</option>
                <option value="CPU" className="bg-[#111923]">CPU Usage</option>
                <option value="RAM" className="bg-[#111923]">RAM Usage</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rack Overview Section */}
        <div className="space-y-6">
          {racks.map((rackName) => {
            const serversInRack = filteredServers.filter((s) => s.rack === rackName);
            const onlineInRack = serversInRack.filter((s) => s.status !== 'OFFLINE').length;

            return (
              <div key={rackName} className="bg-[#0D121A] border border-[#1E2936] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1E2936] pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-3 w-3 rounded-full bg-purple-500" />
                    <h3 className="text-sm font-mono font-extrabold text-slate-100 uppercase tracking-wider">{rackName}</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400 bg-[#111923] px-2.5 py-1 rounded-lg border border-[#1E2936]">
                    <strong className="text-purple-400 font-bold">{onlineInRack}</strong> Nodes Online
                  </span>
                </div>

                {serversInRack.length === 0 ? (
                  /* Rack Empty State */
                  <div className="p-8 text-center rounded-xl bg-[#111923]/50 border border-dashed border-[#1E2936] space-y-2">
                    <Server size={28} className="mx-auto text-slate-600" />
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">{rackName} — NO ACTIVE SERVERS</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      No monitored nodes matching your filter criteria are currently assigned to this rack.
                    </p>
                    <button
                      onClick={() => { setRackFilter('All'); setStatusFilter('All'); setSearchQuery(''); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 transition-colors"
                    >
                      View All Servers
                    </button>
                  </div>
                ) : (
                  /* Server Cards Grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {serversInRack.map((server) => {
                      const isCritical = server.status === 'CRITICAL';
                      const isWarning = server.status === 'WARNING';
                      const isOffline = server.status === 'OFFLINE';

                      let badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
                      let dotColor = 'bg-emerald-500';
                      if (isCritical) {
                        badgeColor = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
                        dotColor = 'bg-rose-500';
                      } else if (isWarning) {
                        badgeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
                        dotColor = 'bg-amber-500';
                      } else if (isOffline) {
                        badgeColor = 'bg-slate-500/15 text-slate-400 border-slate-500/30';
                        dotColor = 'bg-slate-500';
                      }

                      return (
                        <div
                          key={server.id}
                          className={`p-3.5 rounded-xl bg-[#111923] border transition-all flex flex-col justify-between space-y-3 ${
                            isCritical
                              ? 'border-rose-500/50 shadow-lg shadow-rose-500/5'
                              : isWarning
                              ? 'border-amber-500/40'
                              : 'border-[#1E2936] hover:border-purple-500/40'
                          }`}
                        >
                          <div>
                            {/* Card Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-mono font-bold text-xs text-slate-100">{server.hostname}</h4>
                                <span className="text-[10px] text-slate-500 font-mono">{server.rack}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold border flex items-center gap-1 ${badgeColor}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                                {server.status}
                              </span>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-[#0D121A] border border-[#1E2936] text-[11px] font-mono mb-2">
                              <div>
                                <span className="text-slate-500 text-[10px] block">CPU</span>
                                <strong className={server.cpuUsage > 80 ? 'text-rose-400' : 'text-slate-200'}>{server.cpuUsage}%</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px] block">RAM</span>
                                <strong className={server.ramUsage > 80 ? 'text-amber-400' : 'text-slate-200'}>{server.ramUsage}%</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px] block">Temp</span>
                                <strong className={server.temperatureC > 50 ? 'text-amber-400' : 'text-slate-200'}>{server.temperatureC}°C</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px] block">Network</span>
                                <strong className="text-cyan-400">{server.networkMbps} Mbps</strong>
                              </div>
                            </div>

                            {/* Counts & Source */}
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
                              <span>VMs: <strong className="text-purple-300">{server.vmsCount}</strong> | Pods: <strong className="text-blue-300">{server.podsCount}</strong></span>
                              <span className="text-slate-500">{server.lastUpdateSecAgo}s ago</span>
                            </div>

                            {/* Problem Callout Box */}
                            {server.problem && (
                              <div className="mt-2.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[10px] font-mono text-rose-300">
                                <strong>● {server.problem}</strong>
                                <p className="text-slate-400 mt-0.5 truncate">{server.impact}</p>
                              </div>
                            )}
                          </div>

                          {/* Card Footer Button */}
                          <div className="pt-2 border-t border-[#1E2936] flex items-center justify-between gap-2">
                            <span className="text-[9px] font-mono text-slate-500 uppercase">{server.source}</span>
                            <button
                              onClick={() => setInspectServer(server)}
                              className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-purple-600/20 hover:bg-purple-600 text-purple-300 border border-purple-500/30 hover:border-purple-500 transition-all flex items-center gap-1"
                            >
                              Inspect <ExternalLink size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SERVER INSPECTOR DRAWER */}
      {inspectServer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#0D121A] border-l border-[#1E2936] text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-250 font-sans">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#1E2936] flex items-center justify-between bg-[#070A0F]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <Server size={20} />
                </div>
                <div>
                  <h3 className="font-mono font-bold text-sm text-slate-100">{inspectServer.hostname}</h3>
                  <p className="text-xs text-slate-400 font-mono">{inspectServer.rack} • Monitored Node</p>
                </div>
              </div>

              <button
                onClick={() => setInspectServer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#111923]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
              {/* Status Banner */}
              <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">NODE STATUS</span>
                  <span className={`font-bold flex items-center gap-1.5 mt-0.5 ${
                    inspectServer.status === 'CRITICAL' ? 'text-rose-400' : inspectServer.status === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    ● {inspectServer.status}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {inspectServer.source}
                </span>
              </div>

              {/* Problem Callout Box */}
              {inspectServer.problem && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-200 space-y-1.5 font-sans">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-rose-400">
                    <AlertCircle size={15} /> Active Issue: {inspectServer.problem}
                  </div>
                  <p className="text-xs text-slate-300"><strong>Impact:</strong> {inspectServer.impact}</p>
                  <p className="text-xs text-amber-300 font-mono"><strong>Recommended:</strong> {inspectServer.recommendedAction}</p>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                  <span className="text-slate-500 text-[10px] block uppercase">CPU Usage</span>
                  <strong className={`text-base font-bold ${inspectServer.cpuUsage > 80 ? 'text-rose-400' : 'text-slate-100'}`}>{inspectServer.cpuUsage}%</strong>
                </div>

                <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                  <span className="text-slate-500 text-[10px] block uppercase">RAM Usage</span>
                  <strong className={`text-base font-bold ${inspectServer.ramUsage > 80 ? 'text-amber-400' : 'text-slate-100'}`}>{inspectServer.ramUsage}%</strong>
                </div>

                <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                  <span className="text-slate-500 text-[10px] block uppercase">Disk Usage</span>
                  <strong className="text-base font-bold text-slate-100">{inspectServer.diskUsage}%</strong>
                </div>

                <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                  <span className="text-slate-500 text-[10px] block uppercase">Temperature</span>
                  <strong className={`text-base font-bold ${inspectServer.temperatureC > 50 ? 'text-amber-400' : 'text-slate-100'}`}>{inspectServer.temperatureC}°C</strong>
                </div>

                <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                  <span className="text-slate-500 text-[10px] block uppercase">Network Rate</span>
                  <strong className="text-base font-bold text-cyan-400">{inspectServer.networkMbps} Mbps</strong>
                </div>

                <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                  <span className="text-slate-500 text-[10px] block uppercase">Node Uptime</span>
                  <strong className="text-base font-bold text-slate-100">{inspectServer.uptimeHours} hrs</strong>
                </div>
              </div>

              {/* Hosted Virtual Machines */}
              <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Box size={14} className="text-purple-400" /> Hosted VMs ({inspectServer.hostedVms.length})
                  </span>
                </div>
                {inspectServer.hostedVms.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No virtual machines currently hosted.</p>
                ) : (
                  <div className="space-y-1">
                    {inspectServer.hostedVms.map((vmName) => (
                      <button
                        key={vmName}
                        onClick={() => { setInspectServer(null); navigate(`/virtual-machines?inspect=${vmName}`); }}
                        className="w-full p-2 rounded-lg bg-[#0D121A] hover:bg-slate-800 border border-[#1E2936] text-left text-xs font-mono text-purple-300 flex items-center justify-between transition-colors"
                      >
                        <span>{vmName}</span>
                        <ExternalLink size={12} className="text-slate-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Hosted Pods */}
              <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Layers size={14} className="text-cyan-400" /> Hosted Pods / Workloads ({inspectServer.hostedPods.length})
                  </span>
                </div>
                {inspectServer.hostedPods.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No workload pods currently hosted.</p>
                ) : (
                  <div className="space-y-1">
                    {inspectServer.hostedPods.map((podName) => (
                      <button
                        key={podName}
                        onClick={() => { setInspectServer(null); navigate(`/containers?inspect=${podName}`); }}
                        className="w-full p-2 rounded-lg bg-[#0D121A] hover:bg-slate-800 border border-[#1E2936] text-left text-xs font-mono text-cyan-300 flex items-center justify-between transition-colors"
                      >
                        <span>{podName}</span>
                        <ExternalLink size={12} className="text-slate-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Actions Footer */}
            <div className="p-3 border-t border-[#1E2936] bg-[#070A0F] space-y-2">
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  onClick={() => navigate(`/telemetry?asset=${inspectServer.id}`)}
                  className="p-2 rounded-xl bg-[#111923] hover:bg-slate-800 border border-[#1E2936] text-slate-200 font-bold text-center"
                >
                  View Telemetry
                </button>
                <button
                  onClick={() => navigate(`/virtual-machines?host=${inspectServer.id}`)}
                  className="p-2 rounded-xl bg-[#111923] hover:bg-slate-800 border border-[#1E2936] text-purple-300 font-bold text-center"
                >
                  View VMs
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  onClick={() => handleInvestigate(inspectServer)}
                  className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-center flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20"
                >
                  <Bot size={14} /> Investigate
                </button>
                <button
                  onClick={() => navigate('/copilot')}
                  className="p-2 rounded-xl bg-[#111923] hover:bg-slate-800 border border-purple-500/30 text-purple-300 font-bold text-center"
                >
                  Open Copilot
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

export default Servers;
