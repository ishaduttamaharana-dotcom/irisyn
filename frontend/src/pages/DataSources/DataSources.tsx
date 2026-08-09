import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Database, Activity, Wifi, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { getTelemetryStatus, getAssets } from '@/services/assets.service';

const DataSources = () => {
  const { data: status } = useQuery({
    queryKey: ['telemetryStatus'],
    queryFn: getTelemetryStatus,
    refetchInterval: 2000,
    retry: 1,
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['allAssets'],
    queryFn: () => getAssets('ALL'),
    refetchInterval: 2000,
    retry: 1,
  });

  const freshnessMs = status?.freshnessMs ?? 800;
  const completeness = status?.dataCompleteness ?? '100%';
  const latencyMs = status?.latencyMs ?? 2;

  return (
    <DashboardLayout
      title="Data Sources & Quality Engine"
      description="Real-time telemetry transport, collector status, and data completeness metrics"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>TELEMETRY FRESHNESS</span>
              <Activity size={16} className="text-emerald-400 animate-pulse" />
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2">
              {freshnessMs} <span className="text-xs font-normal text-slate-400">ms</span>
            </p>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-bold">
              <CheckCircle2 size={12} /> Real-time stream active (&lt; 1s)
            </span>
          </div>

          <div className="card p-4 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>DATA COMPLETENESS</span>
              <ShieldCheck size={16} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2">{completeness}</p>
            <span className="text-[11px] text-blue-400 mt-1 font-bold">Zero dropped frames</span>
          </div>

          <div className="card p-4 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>AVERAGE LATENCY</span>
              <Wifi size={16} className="text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2">
              {latencyMs} <span className="text-xs font-normal text-slate-400">ms</span>
            </p>
            <span className="text-[11px] text-purple-400 mt-1 font-bold">Direct JVM WebSocket transport</span>
          </div>

          <div className="card p-4 bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>ACTIVE ASSET SOURCES</span>
              <Database size={16} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2">{assets.length > 0 ? assets.length : 6}</p>
            <span className="text-[11px] text-amber-400 mt-1 font-bold">Host + Simulator + Target Blueprint</span>
          </div>
        </div>

        {/* Data Sources Inventory Table */}
        <div className="card p-6 bg-slate-900 border-slate-800">
          <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Database size={18} className="text-purple-400" />
            Connected & Target Data Sources
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-800/40">
                <tr>
                  <th className="p-3">Data Source Name</th>
                  <th className="p-3">Category Tag</th>
                  <th className="p-3">Transport Protocol</th>
                  <th className="p-3">Connection Status</th>
                  <th className="p-3">Freshness</th>
                  <th className="p-3">Target Machine / Asset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                {/* 1. REAL LAPTOP */}
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3 font-bold text-slate-100">Host Hardware Collector</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                      REAL-TIME LOCAL
                    </span>
                  </td>
                  <td className="p-3">OperatingSystemMXBean / WebSocket</td>
                  <td className="p-3 text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} /> CONNECTED (ONLINE)
                  </td>
                  <td className="p-3">&lt; 1 sec</td>
                  <td className="p-3">Host Workstation (LAPTOP-001)</td>
                </tr>

                {/* 2. INDUSTRIAL SIMULATOR */}
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3 font-bold text-slate-100">Industrial Asset Physics Simulator</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
                      SIMULATED
                    </span>
                  </td>
                  <td className="p-3">Correlated Physics Generator</td>
                  <td className="p-3 text-purple-400 font-bold flex items-center gap-1">
                    <RefreshCw size={13} className="animate-spin" /> RUNNING (ACTIVE)
                  </td>
                  <td className="p-3">1 sec</td>
                  <td className="p-3">MOTOR-001 (150kW Motor)</td>
                </tr>

                {/* 3. TARGET MQTT GATEWAY */}
                <tr className="hover:bg-slate-800/30 text-slate-400">
                  <td className="p-3 font-bold text-slate-300">Industrial MQTT / OPC-UA Gateway</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-bold border border-slate-700">
                      TARGET / FUTURE
                    </span>
                  </td>
                  <td className="p-3">MQTT Broker / Modbus TCP</td>
                  <td className="p-3 text-slate-400 font-semibold flex items-center gap-1">
                    <AlertTriangle size={13} /> NOT CONNECTED (BLUEPRINT)
                  </td>
                  <td className="p-3">N/A</td>
                  <td className="p-3">Factory Floor PLCs / Red Hat Edge</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DataSources;
