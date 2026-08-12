import React from 'react';
import { useAssets } from '@/hooks/usePlatformData';
import DataStateContainer from '@/components/ui/DataStateContainer';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import { Box, ShieldCheck, HeartPulse } from 'lucide-react';

export const DigitalTwinView: React.FC = () => {
  const { data: assets, isLoading, isError, refetch } = useAssets();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Box className="w-6 h-6 text-purple-400" />
            <span>Digital Twin State Inspector</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time physical-to-digital state synchronization & multi-factor health models.
          </p>
        </div>
      </div>

      <DataStateContainer
        status="success"
        isLoading={isLoading}
        isError={isError}
        isEmpty={!assets || assets.length === 0}
        onRetry={refetch}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assets?.map((asset) => (
            <div
              key={asset.id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-100">{asset.name}</h3>
                    <DataSourceBadge source={asset.source} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    ID: {asset.id} • Model: {asset.manufacturer} {asset.model}
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-lg">
                    <HeartPulse className="w-5 h-5 animate-pulse" />
                    <span>{asset.healthScore}%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Health Score</span>
                </div>
              </div>

              {/* Operating Metrics & Telemetry snapshot */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Operating Mode</span>
                  <span className="font-bold text-cyan-400">{asset.operatingMode || 'NORMAL'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">CPU / Load</span>
                  <span className="font-bold text-slate-200">{asset.metrics.cpu}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Temperature</span>
                  <span className="font-bold text-amber-400">{asset.metrics.temperature}°C</span>
                </div>
              </div>

              {/* Transparent Health Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Transparent Health Breakdown</span>
                </h4>
                <div className="space-y-1.5">
                  {Object.entries(asset.healthBreakdown || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-xs p-2 rounded bg-slate-950/40">
                      <span className="text-slate-300">{key}</span>
                      <span className={`font-mono font-bold ${val < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {val > 0 ? `+${val}` : val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DataStateContainer>
    </div>
  );
};

export default DigitalTwinView;
