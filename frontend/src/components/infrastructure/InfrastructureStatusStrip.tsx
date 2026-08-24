import { Server, Box, Layers, AlertCircle, AlertTriangle, Radio } from 'lucide-react';
import { MOCK_SERVERS, MOCK_VMS, MOCK_PODS } from '@/services/infrastructureData';

const InfrastructureStatusStrip = () => {
  const onlineServers = MOCK_SERVERS.filter((s) => s.status !== 'OFFLINE').length;
  const runningVms = MOCK_VMS.filter((v) => v.status === 'HEALTHY' || v.status === 'WARNING' || v.status === 'CRITICAL').length;
  const runningPods = MOCK_PODS.filter((p) => p.status === 'RUNNING' || p.status === 'WARNING').length;

  const criticalCount =
    MOCK_SERVERS.filter((s) => s.status === 'CRITICAL').length +
    MOCK_VMS.filter((v) => v.status === 'CRITICAL').length +
    MOCK_PODS.filter((p) => p.status === 'FAILED').length;

  const warningCount =
    MOCK_SERVERS.filter((s) => s.status === 'WARNING').length +
    MOCK_VMS.filter((v) => v.status === 'WARNING').length +
    MOCK_PODS.filter((p) => p.status === 'WARNING').length;

  return (
    <div className="bg-[#0D121A] border border-[#1E2936] rounded-xl px-4 py-2.5 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300">
      <div className="flex items-center gap-2">
        <span className="font-extrabold text-purple-400 uppercase tracking-widest text-[11px]">INFRASTRUCTURE</span>
        <span className="text-slate-600">|</span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1.5">
          <Server size={13} className="text-purple-400" />
          <span className="text-slate-400">Servers:</span>
          <strong className="text-slate-100">{onlineServers} Online</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <Box size={13} className="text-blue-400" />
          <span className="text-slate-400">VMs:</span>
          <strong className="text-slate-100">{runningVms} Running</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <Layers size={13} className="text-cyan-400" />
          <span className="text-slate-400">Containers:</span>
          <strong className="text-slate-100">{runningPods} Running</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <AlertCircle size={13} className="text-rose-400" />
          <span className="text-slate-400">Critical:</span>
          <strong className="text-rose-400 font-extrabold">{criticalCount}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <AlertTriangle size={13} className="text-amber-400" />
          <span className="text-slate-400">Warning:</span>
          <strong className="text-amber-400 font-extrabold">{warningCount}</strong>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
        <Radio size={12} className="animate-pulse" />
        Telemetry: <span className="uppercase">● LIVE</span>
      </div>
    </div>
  );
};

export default InfrastructureStatusStrip;
