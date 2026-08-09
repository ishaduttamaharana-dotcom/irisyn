import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Cpu, Activity, ArrowRight } from 'lucide-react';
import { getAssets } from '@/services/assets.service';
import SimulationControlBar from '@/components/simulation/SimulationControlBar';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';

const AssetList = () => {
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const navigate = useNavigate();

  const { data: assets = [], refetch } = useQuery({
    queryKey: ['assets', selectedSource],
    queryFn: () => getAssets(selectedSource),
    refetchInterval: 2000,
  });

  return (
    <DashboardLayout
      title="Digital Twins Asset Directory"
      description="Real-time physical and simulated asset twin state, health scores, and diagnostics"
    >
      <div className="space-y-6">
        {/* Simulation Control Bar */}
        <SimulationControlBar onScenarioChange={refetch} />

        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter Source:</span>
            {['ALL', 'REAL-TIME LOCAL', 'SIMULATED', 'TARGET / FUTURE'].map((src) => (
              <button
                key={src}
                onClick={() => setSelectedSource(src)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedSource === src
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Showing <strong>{assets.length}</strong> Registered Asset Twins
          </span>
        </div>

        {/* Asset Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => {
            const tone = asset.healthScore >= 80 ? 'default' : asset.healthScore >= 55 ? 'warning' : 'danger';
            return (
              <div
                key={asset.id}
                onClick={() => navigate(`/assets/${asset.id}`)}
                className="card p-5 bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-slate-800 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        {asset.type === 'LAPTOP' ? <Cpu size={22} /> : <Activity size={22} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-base group-hover:text-purple-300 transition-colors">
                          {asset.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono">{asset.id} • {asset.manufacturer}</p>
                      </div>
                    </div>
                    <Badge status={asset.status} />
                  </div>

                  {/* Source Badge */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Data Source:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        asset.source === 'REAL-TIME LOCAL'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : asset.source === 'SIMULATED'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {asset.source}
                    </span>
                  </div>

                  {/* Health Score Gauge Bar */}
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Health Score</span>
                      <span
                        className={
                          asset.healthScore >= 80
                            ? 'text-emerald-400'
                            : asset.healthScore >= 55
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                      >
                        {asset.healthScore}%
                      </span>
                    </div>
                    <ProgressBar value={asset.healthScore} tone={tone} />
                  </div>

                  {/* Explainable Contributors */}
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-950/60 text-[11px] space-y-1 font-mono">
                    <span className="text-slate-400 font-sans font-semibold">Health Factors:</span>
                    {Object.entries(asset.healthBreakdown || {}).map(([factor, delta]) => (
                      <div key={factor} className="flex justify-between text-slate-300">
                        <span>{factor}</span>
                        <span className={delta < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-purple-400 font-semibold group-hover:text-purple-300">
                  <span>Inspect Digital Twin</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssetList;
