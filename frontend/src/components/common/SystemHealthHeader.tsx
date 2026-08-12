import React from 'react';
import { Activity, ShieldCheck, Wifi, Zap } from 'lucide-react';
import { SystemInfo } from '../../types/domain';

interface SystemHealthHeaderProps {
  systemInfo?: SystemInfo | null;
  isLoading?: boolean;
  isError?: boolean;
}

export const SystemHealthHeader: React.FC<SystemHealthHeaderProps> = ({
  systemInfo,
  isLoading,
  isError,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>Syncing platform state...</span>
      </div>
    );
  }

  if (isError || !systemInfo) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/50 text-xs text-red-300">
        <Wifi className="w-3.5 h-3.5 text-red-400" />
        <span className="font-medium">API OFFLINE</span>
      </div>
    );
  }

  const isHealthy = systemInfo.serviceStatus === 'HEALTHY';
  const freshness = systemInfo.telemetryFreshnessMs ?? 150;

  return (
    <div className="hidden lg:flex items-center gap-4 px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs shadow-inner">
      {/* Platform Status */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </span>
        <span className="font-semibold text-slate-200">IRISYN OS</span>
        <span className="text-[10px] text-slate-500 font-mono">v1.0-phase1</span>
      </div>

      <div className="h-3 w-px bg-slate-800" />

      {/* Freshness SLA */}
      <div className="flex items-center gap-1.5 text-slate-400" title="Telemetry freshness SLA latency in milliseconds">
        <Zap className="w-3.5 h-3.5 text-cyan-400" />
        <span>Freshness:</span>
        <span className="font-mono text-cyan-300 font-medium">{freshness}ms</span>
      </div>

      <div className="h-3 w-px bg-slate-800" />

      {/* Active Data Sources Summary */}
      <div className="flex items-center gap-2 text-slate-400">
        <Activity className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-slate-300 font-medium">Data:</span>
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Local hardware telemetry">
            LOCAL
          </span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Synthetic simulation">
            SIM
          </span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 border-dashed" title="Target edge/PLC">
            TARGET
          </span>
        </div>
      </div>

      <div className="h-3 w-px bg-slate-800" />

      {/* Environment */}
      <div className="flex items-center gap-1 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
        <span className="uppercase text-slate-300 font-mono">{systemInfo.environment || 'DEV'}</span>
      </div>
    </div>
  );
};

export default SystemHealthHeader;
