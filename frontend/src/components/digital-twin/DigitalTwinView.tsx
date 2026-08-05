import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Thermometer, Cpu, HardDrive, Network, X, Server as ServerIcon, Boxes, Container as ContainerIcon, Activity } from 'lucide-react';
import { getServers } from '@/services/servers.service';
import { getVirtualMachines } from '@/services/vms.service';
import { getContainers } from '@/services/containers.service';
import { Server } from '@/types/domain';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Simple helper to get color from status
const getStatusColorClass = (status: string) => {
  switch (status) {
    case 'HEALTHY':
    case 'RUNNING':
      return 'border-emerald-500/30 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400';
    case 'WARNING':
    case 'PENDING':
      return 'border-amber-500/30 bg-amber-50/50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400';
    case 'CRITICAL':
    case 'CRASHLOOP':
      return 'border-rose-500/30 bg-rose-50/50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400';
    default:
      return 'border-slate-500/30 bg-slate-50/50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400';
  }
};

const DigitalTwinView = () => {
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  
  // Real-time queries connected to TanStack cache
  const { data: servers = [] } = useQuery({ queryKey: ['servers'], queryFn: getServers });
  const { data: vms = [] } = useQuery({ queryKey: ['vms'], queryFn: getVirtualMachines });
  const { data: containers = [] } = useQuery({ queryKey: ['containers'], queryFn: getContainers });

  const racks = ['Rack A', 'Rack B', 'Rack C'];

  // Match servers to their VMs and containers dynamically
  const serversWithWorkloads = useMemo(() => {
    return servers.map((server, serverIdx) => {
      // VMs hosted on this server
      const hostedVms = vms.filter((v) => v.hostServerId === server.id);
      
      // Distribute containers across servers deterministically
      const hostedContainers = containers.filter((_, idx) => (idx % Math.max(1, servers.length)) === serverIdx);
      
      // Calculate active network traffic based on CPU load
      const simulatedNetwork = Math.round(server.cpuUsage * 1.1 + (serverIdx % 3) * 5);

      return {
        ...server,
        vms: hostedVms,
        containers: hostedContainers,
        networkMbps: simulatedNetwork,
      };
    });
  }, [servers, vms, containers]);

  // Keep a running historical log in memory for the active server's chart
  const [selectedServerHistory, setSelectedServerHistory] = useState<any[]>([]);

  // Update selected server reference if the parent query updates it in the background
  const activeServerDetail = useMemo(() => {
    if (!selectedServer) return null;
    const fresh = serversWithWorkloads.find((s) => s.id === selectedServer.id);
    if (fresh) {
      // Append a timestamped history point for charts (limit to 10 points)
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSelectedServerHistory((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.cpu === fresh.cpuUsage && last.ram === fresh.ramUsage) {
          return prev; // skip duplicates if no changes
        }
        const updated = [...prev, { time: nowStr, cpu: fresh.cpuUsage, ram: fresh.ramUsage, temp: fresh.temperatureC }];
        if (updated.length > 10) updated.shift();
        return updated;
      });
    }
    return fresh;
  }, [selectedServer, serversWithWorkloads]);

  const handleServerClick = (server: Server) => {
    setSelectedServerHistory([]);
    setSelectedServer(server);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Activity size={18} className="text-brand-500 animate-pulse" />
          Interactive 3D-Twin Racks
        </h3>
        <span className="text-xs text-slate-400">Click any server block to inspect live resource metrics</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {racks.map((rack) => {
          const rackServers = serversWithWorkloads.filter((s) => s.rack === rack);
          return (
            <div key={rack} className="card p-4 border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">{rack}</span>
                <span className="text-[11px] font-medium text-slate-400">{rackServers.length} Nodes Online</span>
              </div>

              <div className="space-y-4">
                {rackServers.map((server) => {
                  const statusClass = getStatusColorClass(server.status);
                  return (
                    <div
                      key={server.id}
                      onClick={() => handleServerClick(server)}
                      className={`group relative rounded-xl border p-4 cursor-pointer hover:scale-[1.01] hover:-translate-y-[1px] active:scale-[0.99] transition-all duration-200 shadow-sm hover:shadow ${statusClass}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ServerIcon size={14} className="group-hover:rotate-12 transition-transform" />
                          <span className="text-xs font-bold tracking-tight">{server.hostname}</span>
                        </div>
                        <Badge status={server.status} />
                      </div>

                      {/* Micro resource status grid */}
                      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1"><Cpu size={10} /> CPU</span>
                            <span>{server.cpuUsage}%</span>
                          </div>
                          <ProgressBar value={server.cpuUsage} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1"><HardDrive size={10} /> RAM</span>
                            <span>{server.ramUsage}%</span>
                          </div>
                          <ProgressBar value={server.ramUsage} />
                        </div>
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 col-span-2 pt-1 border-t border-slate-200/30 dark:border-slate-800/30 mt-1">
                          <span className="flex items-center gap-1"><Thermometer size={10} /> {server.temperatureC}°C</span>
                          <span className="flex items-center gap-1"><Network size={10} /> {server.networkMbps} Mbps</span>
                        </div>
                      </div>

                      {/* Nested VMs / Containers Count indicator */}
                      <div className="mt-2.5 flex gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Boxes size={10} /> {server.vms.length} VMs</span>
                        <span className="flex items-center gap-1"><ContainerIcon size={10} /> {server.containers.length} Pods</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Server Inspector Modal */}
      {activeServerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${getStatusColorClass(activeServerDetail.status)}`}>
                  <ServerIcon size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{activeServerDetail.hostname}</h4>
                  <p className="text-xs text-slate-400">
                    Location: {activeServerDetail.rack} | Uptime: {activeServerDetail.uptimeHours} hrs
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedServer(null)}
                className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Detailed Metrics Panel */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Resource Utilization (Real-time Stream)</h5>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Real-time active
                  </span>
                </div>
                
                {/* Metric Line Chart */}
                <div className="h-56 w-full rounded-xl bg-slate-50 dark:bg-slate-950 p-2 border border-slate-100 dark:border-slate-900/50">
                  {selectedServerHistory.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedServerHistory}>
                        <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 9 }} domain={[0, 100]} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ fontSize: 11 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="cpu" name="CPU (%)" stroke="#2f7cf6" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="ram" name="RAM (%)" stroke="#22c55e" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      Collecting server telemetry points...
                    </div>
                  )}
                </div>

                {/* Progress bars inside Modal */}
                <div className="grid grid-cols-3 gap-4 text-xs font-semibold">
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <span className="text-slate-400 block mb-1">CPU Load</span>
                    <span className="text-lg font-bold">{activeServerDetail.cpuUsage}%</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <span className="text-slate-400 block mb-1">RAM Usage</span>
                    <span className="text-lg font-bold">{activeServerDetail.ramUsage}%</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <span className="text-slate-400 block mb-1">Disk Allocation</span>
                    <span className="text-lg font-bold">{activeServerDetail.diskUsage}%</span>
                  </div>
                </div>
              </div>

              {/* Hosted Virtual workloads */}
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Hosted Virtual Machines ({activeServerDetail.vms.length})</h5>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {activeServerDetail.vms.length > 0 ? (
                      activeServerDetail.vms.map((v) => (
                        <div key={v.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{v.name}</span>
                          <Badge status={v.status} />
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 block italic">No VM instances on this host</span>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Hosted Pods/Containers ({activeServerDetail.containers.length})</h5>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {activeServerDetail.containers.length > 0 ? (
                      activeServerDetail.containers.map((c) => (
                        <div key={c.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-slate-800 text-xs">
                          <div className="truncate pr-2">
                            <span className="font-semibold text-slate-700 dark:text-slate-200 block truncate">{c.name}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{c.podName}</span>
                          </div>
                          <Badge status={c.status} />
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 block italic">No Kubernetes pods assigned</span>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalTwinView;
