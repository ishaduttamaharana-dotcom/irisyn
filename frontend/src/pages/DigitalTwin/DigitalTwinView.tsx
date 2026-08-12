import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAssets } from '@/hooks/usePlatformData';
import DataStateContainer from '@/components/ui/DataStateContainer';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import SpatialDigitalTwinView from '@/components/digital-twin/DigitalTwinView';
import { Box, HeartPulse, Clock, Radio, X, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDigitalTwinHistory, getDigitalTwinSensors } from '@/services/digitalTwin.service';
import { getFreshnessInfo } from '@/utils/freshnessUtils';

export const DigitalTwinView: React.FC = () => {
  const { data: assets, isLoading, isError, refetch } = useAssets();
  const [selectedAssetId, setSelectedAssetId] = useState<string>('LAPTOP-001');
  const [selectedMetric, setSelectedMetric] = useState<{ name: string; value: string; unit: string; baseline: string } | null>(null);

  const selectedAsset = assets?.find((a) => a.id === selectedAssetId) || assets?.[0];

  const { data: twinHistory = [] } = useQuery({
    queryKey: ['twin-history', selectedAssetId],
    queryFn: () => getDigitalTwinHistory(selectedAssetId),
    enabled: !!selectedAssetId,
  });

  const { data: twinSensors = [] } = useQuery({
    queryKey: ['twin-sensors', selectedAssetId],
    queryFn: () => getDigitalTwinSensors(selectedAssetId),
    enabled: !!selectedAssetId,
  });

  const freshnessInfo = getFreshnessInfo(selectedAsset?.lastUpdated);

  return (
    <DashboardLayout
      title="Digital Twin Core State Inspector"
      description="SEE • PREDICT • ACT — Structured Physical-to-Digital State Synchronization & Operating Modes"
    >
      <div className="space-y-6">
        {/* Asset Selection & Twin Registry Bar */}
        <div className="card p-4 bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Box className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                Active Digital Twin Registry
              </h3>
              <p className="text-xs text-slate-400">Select an asset twin to inspect synchronized state and transition history</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {assets?.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setSelectedAssetId(a.id);
                  setSelectedMetric(null);
                }}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border ${
                  selectedAssetId === a.id
                    ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {a.id} ({a.name.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>

        <DataStateContainer
          status="success"
          isLoading={isLoading}
          isError={isError}
          isEmpty={!assets || assets.length === 0}
          onRetry={refetch}
        >
          {selectedAsset && (
            <div className="space-y-6">
              {/* 1. Twin Header — Asset Identity, State, Source, Health & Freshness */}
              <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl font-bold font-mono text-slate-100">{selectedAsset.id}</h2>
                      <span className="text-sm text-slate-300 font-semibold">• {selectedAsset.name}</span>
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                        ● {selectedAsset.operatingMode || 'RUNNING'}
                      </span>
                      <DataSourceBadge source={selectedAsset.source} size="sm" />
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Type: {selectedAsset.type} • Manufacturer: {selectedAsset.manufacturer} • Model: {selectedAsset.model} • Serial: {selectedAsset.serialNumber || 'SN-2026-904'}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Health Score</span>
                      <div className="flex items-center gap-1 text-emerald-400 font-bold text-2xl font-mono">
                        <HeartPulse className="w-5 h-5 animate-pulse" />
                        <span>{selectedAsset.healthScore}%</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Freshness SLA</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold border inline-block mt-0.5 ${freshnessInfo.badgeClass}`}>
                        {freshnessInfo.label}
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">State Version</span>
                      <span className="text-sm font-bold text-cyan-300">v{selectedAsset.stateVersion || 12}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Interactive KPI Row (Click metric to inspect details) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                  <button
                    onClick={() => setSelectedMetric({ name: 'Health Score', value: `${selectedAsset.healthScore}%`, unit: '%', baseline: '100%' })}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 text-left transition-all"
                  >
                    <span className="text-slate-400 font-sans text-[11px] block uppercase">Health Score</span>
                    <strong className="text-emerald-400 text-lg font-bold mt-1 block">{selectedAsset.healthScore}%</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Click to inspect breakdown</span>
                  </button>

                  <button
                    onClick={() => setSelectedMetric({ name: 'CPU Load / RPM', value: `${selectedAsset.metrics.cpu}%`, unit: '%', baseline: '< 75%' })}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 text-left transition-all"
                  >
                    <span className="text-slate-400 font-sans text-[11px] block uppercase">CPU / Load</span>
                    <strong className="text-cyan-300 text-lg font-bold mt-1 block">{selectedAsset.metrics.cpu}%</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Freq: {selectedAsset.metrics.cpuFreqGHz || 2.8} GHz</span>
                  </button>

                  <button
                    onClick={() => setSelectedMetric({ name: 'Temperature', value: `${selectedAsset.metrics.temperature}°C`, unit: '°C', baseline: '< 65°C' })}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 text-left transition-all"
                  >
                    <span className="text-slate-400 font-sans text-[11px] block uppercase">Temperature</span>
                    <strong className="text-amber-300 text-lg font-bold mt-1 block">{selectedAsset.metrics.temperature}°C</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Thermal: Normal</span>
                  </button>

                  <button
                    onClick={() => setSelectedMetric({ name: 'RAM Utilization', value: `${selectedAsset.metrics.ram}%`, unit: '%', baseline: '< 85%' })}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 text-left transition-all"
                  >
                    <span className="text-slate-400 font-sans text-[11px] block uppercase">RAM Utilization</span>
                    <strong className="text-purple-300 text-lg font-bold mt-1 block">{selectedAsset.metrics.ram}%</strong>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{selectedAsset.metrics.ramUsedGb || 7.8} / {selectedAsset.metrics.ramTotalGb || 16} GB</span>
                  </button>
                </div>
              </div>

              {/* Metric Inspection Modal/Drawer */}
              {selectedMetric && (
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-3 font-mono text-xs relative animate-fadeIn">
                  <button
                    onClick={() => setSelectedMetric(null)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                  >
                    <X size={16} />
                  </button>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-bold text-purple-200 uppercase">Metric Detail Inspector: {selectedMetric.name}</h4>
                  </div>
                  <div className="grid grid-cols-4 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-sans">Current Value</span>
                      <strong className="text-cyan-300 block text-sm">{selectedMetric.value}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-sans">Baseline Threshold</span>
                      <strong className="text-slate-300 block text-sm">{selectedMetric.baseline}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-sans">Data Quality</span>
                      <strong className="text-emerald-400 block text-sm">GOOD (100%)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-sans">Source</span>
                      <strong className="text-purple-300 block text-sm">{selectedAsset.source}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Spatial Digital Twin Visualizer */}
              <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                    <Box className="w-4 h-4 text-purple-400" />
                    <span>State-Driven Spatial Digital Twin Visualizer</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">State: <strong className="text-purple-300">{selectedAsset.operatingMode}</strong></span>
                </div>
                <SpatialDigitalTwinView />
              </div>

              {/* 4. Live State & Sensor Matrix Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live State Card */}
                <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span>Synchronized Live Twin State</span>
                  </h4>
                  <div className="space-y-3 text-xs font-mono">
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 font-sans">Operating Mode:</span>
                      <strong className="text-purple-300 uppercase">{selectedAsset.operatingMode || 'RUNNING'}</strong>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 font-sans">State Version:</span>
                      <strong className="text-cyan-300">v{selectedAsset.stateVersion || 12}</strong>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 font-sans">Synchronization SLA:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${freshnessInfo.badgeClass}`}>{freshnessInfo.label}</span>
                    </div>
                  </div>
                </div>

                {/* Sensor Matrix */}
                <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Radio className="w-4 h-4 text-emerald-400" />
                    <span>Sensor Telemetry Stream Matrix</span>
                  </h4>
                  <div className="space-y-2">
                    {twinSensors.map((s) => (
                      <div key={s.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-200 font-sans font-semibold">{s.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          ● {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Chronological Operating Mode Timeline (Locked height 420px with scroll controls) */}
              <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4 max-h-[420px] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>Operating Mode Transition Timeline</span>
                  </h4>
                  <span className="text-xs font-mono text-purple-300 font-bold">
                    {twinHistory.length} Recorded Transitions
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-1">
                  {twinHistory.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{item.previousMode || 'IDLE'}</span>
                          <span className="text-purple-400 font-bold">→</span>
                          <span className="text-cyan-300 font-bold uppercase">{item.newMode}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans mt-1">{item.triggerReason}</p>
                        <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleString()}</span>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Health: {item.healthScore}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DataStateContainer>
      </div>
    </DashboardLayout>
  );
};

export default DigitalTwinView;
