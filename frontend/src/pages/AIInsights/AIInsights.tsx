import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Brain, Activity, TrendingUp, AlertTriangle, ShieldCheck, PlayCircle, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { getServers } from '@/services/servers.service';
import { apiClient } from '@/services/apiClient';
import Badge from '@/components/ui/Badge';
import { mockServers } from '@/services/mockData';

interface Prediction {
  targetId: string;
  predictedFailureProbability: number;
  recommendedAction: string;
  healthScore: number;
  failureType: string;
  confidenceScore: number;
}

const defaultPredictions: Prediction[] = [
  { targetId: 'MOTOR-001', predictedFailureProbability: 0.72, recommendedAction: 'Inspect stator thermal radiator & bearing lubrication', healthScore: 72, failureType: 'BEARING_DEGRADATION', confidenceScore: 0.94 },
  { targetId: 'PUMP-001', predictedFailureProbability: 0.15, recommendedAction: 'Maintain routine impeller inspection cycle', healthScore: 92, failureType: 'NONE', confidenceScore: 0.98 },
  { targetId: 'LAPTOP-001', predictedFailureProbability: 0.08, recommendedAction: 'Workstation operating within nominal tolerances', healthScore: 96, failureType: 'NONE', confidenceScore: 0.99 },
  { targetId: 'dc-node-03', predictedFailureProbability: 0.88, recommendedAction: 'Migrate active guest workloads via OpenShift Virtualization', healthScore: 64, failureType: 'CPU_OVERLOAD', confidenceScore: 0.92 },
];

const AIInsights = () => {
  const queryClient = useQueryClient();
  const [selectedServerId, setSelectedServerId] = useState<string>('MOTOR-001');

  // Fetch servers to select target with fallback
  const { data: servers = mockServers } = useQuery({ queryKey: ['servers'], queryFn: getServers, retry: 1 });

  // Fetch prediction history with fallback
  const {
    data: history = defaultPredictions,
    refetch,
  } = useQuery<Prediction[]>({
    queryKey: ['predictions'],
    queryFn: () => apiClient.get('/prediction/history').then((r) => r.data),
    retry: 1,
  });

  // Run prediction mutation
  const predictMutation = useMutation({
    mutationFn: (targetId: string) =>
      apiClient.post<Prediction>('/predict', { targetId, horizonMinutes: 60 }).then((r) => r.data),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['servers'] });
    },
  });

  const handlePredict = () => {
    if (selectedServerId) {
      predictMutation.mutate(selectedServerId);
    }
  };

  // Calculate global cluster health score average
  const avgHealth = history.length > 0
    ? Math.round(history.reduce((a, p) => a + p.healthScore, 0) / history.length)
    : 81;

  const topRisks = history.filter((p) => p.predictedFailureProbability > 0.6);

  return (
    <DashboardLayout title="AI Insights & Predictive Maintenance" description="Predictive telemetry inference powered by OpenShift AI model blueprints">
      <div className="space-y-6">
        
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4 bg-slate-900 border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Global Asset Fleet Health</span>
              <p className="text-2xl font-bold mt-1 text-slate-100">{avgHealth}%</p>
            </div>
            <Activity className="text-emerald-400" size={32} />
          </div>
          <div className="card p-4 bg-slate-900 border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">Active Parameter Risk Vectors</span>
              <p className="text-2xl font-bold mt-1 text-slate-100">{topRisks.length} Asset Twins</p>
            </div>
            <AlertTriangle className={topRisks.length > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-400'} size={32} />
          </div>
          <div className="card p-4 bg-slate-900 border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Model Inference Confidence</span>
              <p className="text-2xl font-bold mt-1 text-slate-100">96.8%</p>
            </div>
            <ShieldCheck className="text-purple-400" size={32} />
          </div>
        </div>

        {/* Interactive Prediction Panel */}
        <div className="card p-5 bg-slate-900 border-slate-800">
          <h3 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Brain size={16} className="text-purple-400" /> Run OpenShift AI Telemetry Inference
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedServerId}
              onChange={(e) => setSelectedServerId(e.target.value)}
              className="flex-1 rounded-lg border border-slate-800 p-2.5 text-xs bg-slate-950 text-slate-100 font-mono"
            >
              <option value="MOTOR-001">MOTOR-001 (Siemens 150kW Induction Motor)</option>
              <option value="LAPTOP-001">LAPTOP-001 (Host Workstation System)</option>
              <option value="PUMP-001">PUMP-001 (Centrifugal Fluid Pump)</option>
              {servers.map((s) => (
                <option key={s.id} value={s.hostname || s.id}>
                  {s.hostname} ({s.rack} - CPU {s.cpuUsage}% / Temp {s.temperatureC}°C)
                </option>
              ))}
            </select>
            <button
              onClick={handlePredict}
              disabled={!selectedServerId || predictMutation.isPending}
              className="rounded-lg bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
            >
              {predictMutation.isPending ? <RefreshCw className="animate-spin" size={16} /> : <PlayCircle size={16} />}
              Analyze Telemetry
            </button>
          </div>

          {predictMutation.isSuccess && predictMutation.data && (
            <div className="mt-4 p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block mb-1">Failure Risk</span>
                <span className="text-lg font-bold text-rose-400">{(predictMutation.data.predictedFailureProbability * 100).toFixed(0)}%</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Anomaly Target</span>
                <span className="text-lg font-bold text-slate-100">{predictMutation.data.failureType}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Confidence Score</span>
                <span className="text-lg font-bold text-slate-100">{(predictMutation.data.confidenceScore * 100).toFixed(0)}%</span>
              </div>
              <div className="col-span-2 sm:col-span-4 border-t border-slate-800 pt-3 font-sans">
                <span className="text-slate-400 block mb-1">AI Recommendation</span>
                <p className="font-semibold text-slate-100 text-xs">{predictMutation.data.recommendedAction}</p>
              </div>
            </div>
          )}
        </div>

        {/* Prediction Execution Log History */}
        <div className="card p-5 bg-slate-900 border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-400" /> Telemetry Inference History
            </h3>
            <button onClick={() => refetch()} className="p-1 rounded hover:bg-slate-800 text-slate-400">
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold bg-slate-800/40">
                  <th className="p-2.5">Target Host ID</th>
                  <th className="p-2.5 text-center">Health Score</th>
                  <th className="p-2.5 text-center">Failure Risk</th>
                  <th className="p-2.5">Anomaly Type</th>
                  <th className="p-2.5">Mitigation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {history.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold text-purple-400">{p.targetId}</td>
                    <td className="p-2.5 text-center font-bold">
                      <span className={p.healthScore < 70 ? 'text-rose-400' : p.healthScore < 90 ? 'text-amber-400' : 'text-emerald-400'}>
                        {p.healthScore}%
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-bold">
                      <span className={p.predictedFailureProbability > 0.7 ? 'text-rose-400' : p.predictedFailureProbability > 0.3 ? 'text-amber-400' : 'text-emerald-400'}>
                        {(p.predictedFailureProbability * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-2.5">
                      <Badge status={p.failureType === 'NONE' ? 'HEALTHY' : (p.failureType === 'CPU_OVERLOAD' || p.failureType === 'BEARING_DEGRADATION' ? 'WARNING' : 'CRITICAL')}>
                        {p.failureType}
                      </Badge>
                    </td>
                    <td className="p-2.5 truncate max-w-xs font-sans">{p.recommendedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AIInsights;
