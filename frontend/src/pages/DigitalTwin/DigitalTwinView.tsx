import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAssets } from '@/hooks/usePlatformData';
import DataStateContainer from '@/components/ui/DataStateContainer';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import SpatialDigitalTwinView from '@/components/digital-twin/DigitalTwinView';
import { Box, HeartPulse, Wrench, Clock, Radio } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDigitalTwinHistory, getDigitalTwinSensors } from '@/services/digitalTwin.service';
import { getFreshnessInfo } from '@/utils/freshnessUtils';

export const DigitalTwinView: React.FC = () => {
  const { data: assets, isLoading, isError, refetch } = useAssets();
  const [selectedAssetId, setSelectedAssetId] = useState<string>('LAPTOP-001');

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
      title="Digital Twin Core State Engine"
      description="SEE • PREDICT • ACT — Structured Physical-to-Digital State Synchronization & Operating Modes"
    >
      <div className="space-y-6">
        {/* Asset Selection Bar */}
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
                onClick={() => setSelectedAssetId(a.id)}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Asset Identity & Current Twin State */}
              <div className="space-y-6">
                {/* Asset Identity Card */}
                <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-100">{selectedAsset.name}</h3>
                        <DataSourceBadge source={selectedAsset.source} size="sm" />
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        ID: {selectedAsset.id} • Type: {selectedAsset.type}
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xl font-mono">
                        <HeartPulse className="w-5 h-5 animate-pulse" />
                        <span>{selectedAsset.healthScore}%</span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Health Score</span>
                    </div>
                  </div>

                  {/* Metadata Specs */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block font-sans">Manufacturer</span>
                      <strong className="text-slate-200">{selectedAsset.manufacturer}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block font-sans">Model</span>
                      <strong className="text-slate-200">{selectedAsset.model}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block font-sans">Serial Number</span>
                      <strong className="text-purple-300">{selectedAsset.serialNumber || 'SN-2026-094'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block font-sans">Config Version</span>
                      <strong className="text-cyan-300">{selectedAsset.configVersion || 'v1.0-twin'}</strong>
                    </div>
                  </div>

                  {/* Operating Mode State Indicator */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-xs font-sans block">Operating Mode</span>
                      <span className="text-sm font-bold font-mono text-purple-300 uppercase tracking-wider">
                        ● {selectedAsset.operatingMode || 'RUNNING'}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${freshnessInfo.badgeClass}`}>
                      {freshnessInfo.label}
                    </span>
                  </div>

                  {/* Maintenance Schedule */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1"><Wrench className="w-3.5 h-3.5 text-amber-400" /> Maintenance Status</span>
                      <span className="font-mono text-emerald-400 font-bold">{selectedAsset.maintenanceStatus || 'OK'}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
                      <span>Last: {selectedAsset.lastMaintenanceDate || '2026-05-15'}</span>
                      <span>Next: {selectedAsset.nextMaintenanceDate || '2026-11-15'}</span>
                    </div>
                  </div>
                </div>

                {/* Sensor Matrix */}
                <div className="card p-6 bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span>Connected Sensor Matrix</span>
                  </h4>
                  <div className="space-y-2">
                    {twinSensors.map((s) => (
                      <div key={s.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-slate-200">{s.name}</span>
                          <span className="text-[10px] text-slate-500 block font-mono">Type: {s.type}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle & Right Column: Interactive 3D Rack Spatial View & State History Timeline */}
              <div className="lg:col-span-2 space-y-6">
                {/* Interactive 3D Spatial Racks */}
                <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                    <Box className="w-4 h-4 text-purple-400" />
                    <span>Spatial Digital Twin Visualizer</span>
                  </h3>
                  <SpatialDigitalTwinView />
                </div>

                {/* Chronological State Transition Timeline */}
                <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>Operating Mode Transition Timeline</span>
                    </h4>
                    <span className="text-xs font-mono text-purple-300 font-bold">
                      {twinHistory.length} Recorded Transitions
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs max-h-72 overflow-y-auto pr-1">
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
            </div>
          )}
        </DataStateContainer>
      </div>
    </DashboardLayout>
  );
};

export default DigitalTwinView;
