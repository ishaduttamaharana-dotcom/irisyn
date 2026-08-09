import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ArrowLeft, Activity, ShieldCheck, Wrench } from 'lucide-react';
import { getAssetById } from '@/services/assets.service';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import SimulationControlBar from '@/components/simulation/SimulationControlBar';

const AssetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: asset, isLoading, isError, refetch } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => getAssetById(id || 'LAPTOP-001'),
    refetchInterval: 1500,
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Asset Detail" description="Loading Digital Twin state...">
        <div className="p-12 text-center text-slate-400">Loading asset parameters...</div>
      </DashboardLayout>
    );
  }

  if (isError || !asset) {
    return (
      <DashboardLayout title="Asset Detail" description="Asset Not Found">
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-300 font-semibold mb-4">Asset ID "{id}" was not found or gateway is disconnected.</p>
          <button onClick={() => navigate('/assets')} className="btn btn-primary text-xs">
            Return to Assets Directory
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const tone = asset.healthScore >= 80 ? 'default' : asset.healthScore >= 55 ? 'warning' : 'danger';

  return (
    <DashboardLayout
      title={`Digital Twin: ${asset.name}`}
      description={`${asset.id} • ${asset.manufacturer} ${asset.model}`}
    >
      <div className="space-y-6">
        {/* Navigation & Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/assets')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Assets Directory
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                asset.source === 'REAL-TIME LOCAL'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : asset.source === 'SIMULATED'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {asset.source}
            </span>
            <Badge status={asset.status} />
          </div>
        </div>

        {/* Demo Controls if Simulated */}
        {asset.source === 'SIMULATED' && <SimulationControlBar onScenarioChange={refetch} />}

        {/* Header Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-5 bg-slate-900 border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">HEALTH SCORE</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span
                className={`text-3xl font-extrabold ${
                  asset.healthScore >= 80
                    ? 'text-emerald-400'
                    : asset.healthScore >= 55
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {asset.healthScore}%
              </span>
              <span className="text-xs text-slate-400">Explainable Composite</span>
            </div>
            <div className="mt-3">
              <ProgressBar value={asset.healthScore} tone={tone} />
            </div>
          </div>

          <div className="card p-5 bg-slate-900 border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">OPERATING MODE</span>
            <p className="text-xl font-bold text-slate-100 mt-2">{asset.operatingMode}</p>
            <span className="text-xs text-slate-400 mt-1 block">State Engine Status</span>
          </div>

          <div className="card p-5 bg-slate-900 border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">OPERATING HOURS</span>
            <p className="text-xl font-bold text-slate-100 mt-2">{asset.operatingHours} hrs</p>
            <span className="text-xs text-slate-400 mt-1 block">Cumulative Lifetime</span>
          </div>

          <div className="card p-5 bg-slate-900 border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">DATA FRESHNESS</span>
            <p className="text-xl font-bold text-emerald-400 mt-2">LIVE ●</p>
            <span className="text-xs text-slate-400 mt-1 block">Updated &lt; 1 sec ago</span>
          </div>
        </div>

        {/* Real-time Telemetry Grid */}
        <div className="card p-6 bg-slate-900 border-slate-800">
          <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-purple-400" />
            Live Physical Parameter Telemetry
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400 font-sans font-semibold">TEMPERATURE</span>
              <p className="text-2xl font-bold text-slate-100 mt-1 font-mono">{asset.metrics.temperature} °C</p>
              <span className="text-[10px] text-slate-400 mt-1 block font-sans">Thermal Sensor</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400 font-sans font-semibold">
                {asset.type === 'INDUSTRIAL_MOTOR' ? 'LOAD (%)' : 'CPU UTILIZATION'}
              </span>
              <p className="text-2xl font-bold text-slate-100 mt-1 font-mono">{asset.metrics.cpu}%</p>
              <span className="text-[10px] text-slate-400 mt-1 block font-sans">
                {asset.type === 'INDUSTRIAL_MOTOR' ? 'Shaft Load' : `${asset.metrics.cpuFreqGHz} GHz Dynamic`}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400 font-sans font-semibold">
                {asset.type === 'INDUSTRIAL_MOTOR' ? 'VIBRATION (mm/s)' : 'STORAGE USED'}
              </span>
              <p className="text-2xl font-bold text-slate-100 mt-1 font-mono">
                {asset.metrics.disk} {asset.type === 'INDUSTRIAL_MOTOR' ? 'mm/s' : '%'}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block font-sans">
                {asset.type === 'INDUSTRIAL_MOTOR' ? 'RMS Vibration' : `${asset.metrics.diskUsedGb}/${asset.metrics.diskTotalGb} GB`}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
              <span className="text-slate-400 font-sans font-semibold">
                {asset.type === 'INDUSTRIAL_MOTOR' ? 'CURRENT (A)' : 'MEMORY USED'}
              </span>
              <p className="text-2xl font-bold text-slate-100 mt-1 font-mono">
                {asset.metrics.networkInKbps} {asset.type === 'INDUSTRIAL_MOTOR' ? 'A' : '%'}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block font-sans">
                {asset.type === 'INDUSTRIAL_MOTOR' ? 'Stator Current' : `${asset.metrics.ramUsedGb}/${asset.metrics.ramTotalGb} GB`}
              </span>
            </div>
          </div>
        </div>

        {/* Explainable Health Factors & AI Predictions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Health Contributor Breakdown */}
          <div className="card p-6 bg-slate-900 border-slate-800">
            <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              Explainable Health Factors
            </h3>
            <div className="space-y-2 font-mono text-xs">
              {Object.entries(asset.healthBreakdown || {}).map(([factor, delta]) => (
                <div key={factor} className="flex justify-between p-2.5 rounded bg-slate-800/50">
                  <span className="text-slate-300 font-sans">{factor}</span>
                  <span className={delta < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Predictions & Recommended Actions */}
          <div className="card p-6 bg-slate-900 border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
                <Wrench size={18} className="text-amber-400" />
                AI Insights & Predictive Maintenance
              </h3>
              <p className="text-sm text-slate-200 font-medium">{asset.currentPrediction || 'Normal operational trend'}</p>
              <p className="text-xs text-amber-400 mt-2 font-semibold">
                Recommended Action: <span className="text-slate-300 font-normal">{asset.recommendedAction || 'None required'}</span>
              </p>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
              {asset.source === 'SIMULATED' ? (
                <span className="text-purple-300 font-semibold">
                  SIMULATION / DEMONSTRATION MODE: Synthetic asset predictions generated by correlated physics simulator.
                </span>
              ) : (
                <span className="text-emerald-300 font-semibold">
                  REAL-TIME LOCAL TELEMETRY: Host hardware parameters measured live.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssetDetail;
