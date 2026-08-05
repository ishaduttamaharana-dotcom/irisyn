import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Brain, Activity, TrendingUp, AlertTriangle, ShieldCheck, PlayCircle, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { getServers } from '@/services/servers.service';
import { apiClient } from '@/services/apiClient';
import PageLoader from '@/components/loading/PageLoader';
import ErrorState from '@/components/error/ErrorState';
import Badge from '@/components/ui/Badge';

interface Prediction {
  targetId: string;
  predictedFailureProbability: number;
  recommendedAction: string;
  healthScore: number;
  failureType: string;
  confidenceScore: number;
}

const AIInsights = () => {
  const queryClient = useQueryClient();
  const [selectedServerId, setSelectedServerId] = useState<string>('');

  // Fetch servers to select target
  const { data: servers = [] } = useQuery({ queryKey: ['servers'], queryFn: getServers });

  // Fetch prediction history
  const {
    data: history = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Prediction[]>({
    queryKey: ['predictions'],
    queryFn: () => apiClient.get('/prediction/history').then((r) => r.data),
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

  if (isLoading) {
    return (
      <DashboardLayout title="AI Insights" description="Consulting OpenShift AI models...">
        <PageLoader />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="AI Insights" description="Offline">
        <ErrorState message="Could not fetch AI predictions." onRetry={refetch} />
      </DashboardLayout>
    );
  }

  // Calculate global cluster health score average
  const avgHealth = history.length > 0
    ? Math.round(history.reduce((a, p) => a + p.healthScore, 0) / history.length)
    : 98;

  const topRisks = history.filter((p) => p.predictedFailureProbability > 0.6);

  return (
    <DashboardLayout title="AI Insights" description="Predictive SRE analysis powered by OpenShift AI">
      <div className="space-y-6">
        
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Global Cluster Health</span>
              <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{avgHealth}%</p>
            </div>
            <Activity className="text-emerald-500" size={32} />
          </div>
          <div className="card p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Risk Vectors</span>
              <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">{topRisks.length} Nodes</p>
            </div>
            <AlertTriangle className={topRisks.length > 0 ? 'text-rose-500 animate-bounce' : 'text-slate-400'} size={32} />
          </div>
          <div className="card p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Model Confidence</span>
              <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">96.8%</p>
            </div>
            <ShieldCheck className="text-brand-500" size={32} />
          </div>
        </div>

        {/* Interactive Prediction Panel */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Brain size={16} className="text-brand-500" /> Run OpenShift AI Telemetry Inference
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedServerId}
              onChange={(e) => setSelectedServerId(e.target.value)}
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 text-sm bg-white dark:bg-slate-900"
            >
              <option value="">Select target hypervisor node...</option>
              {servers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.hostname} ({s.rack} - CPU {s.cpuUsage}% / Temp {s.temperatureC}°C)
                </option>
              ))}
            </select>
            <button
              onClick={handlePredict}
              disabled={!selectedServerId || predictMutation.isPending}
              className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {predictMutation.isPending ? <RefreshCw className="animate-spin" size={16} /> : <PlayCircle size={16} />}
              Analyze Telemetry
            </button>
          </div>

          {predictMutation.isSuccess && predictMutation.data && (
            <div className="mt-4 p-4 rounded-xl border border-brand-100 dark:border-brand-900/30 bg-brand-50/20 dark:bg-brand-950/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Failure Risk</span>
                <span className="text-lg font-bold text-rose-500">{(predictMutation.data.predictedFailureProbability * 100).toFixed(0)}%</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Anomaly Target</span>
                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{predictMutation.data.failureType}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Confidence Score</span>
                <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{(predictMutation.data.confidenceScore * 100).toFixed(0)}%</span>
              </div>
              <div className="col-span-2 sm:col-span-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-slate-400 block mb-1">AI Recommendation</span>
                <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{predictMutation.data.recommendedAction}</p>
              </div>
            </div>
          )}
        </div>

        {/* Prediction Execution Log History */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-500" /> Telemetry Inference History
            </h3>
            <button onClick={() => refetch()} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-2.5">Target Host ID</th>
                  <th className="py-2.5 text-center">Health Score</th>
                  <th className="py-2.5 text-center">Failure Risk</th>
                  <th className="py-2.5">Anomaly Type</th>
                  <th className="py-2.5">Mitigation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                {history.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-3 font-mono">{p.targetId}</td>
                    <td className="py-3 text-center font-bold">
                      <span className={p.healthScore < 70 ? 'text-rose-500' : p.healthScore < 90 ? 'text-amber-500' : 'text-emerald-500'}>
                        {p.healthScore}%
                      </span>
                    </td>
                    <td className="py-3 text-center font-bold">
                      <span className={p.predictedFailureProbability > 0.7 ? 'text-rose-500' : p.predictedFailureProbability > 0.3 ? 'text-amber-500' : 'text-emerald-500'}>
                        {(p.predictedFailureProbability * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3">
                      <Badge status={p.failureType === 'NONE' ? 'HEALTHY' : (p.failureType === 'CPU_OVERLOAD' || p.failureType === 'MEMORY_LEAK' ? 'WARNING' : 'CRITICAL')}>
                        {p.failureType}
                      </Badge>
                    </td>
                    <td className="py-3 truncate max-w-xs">{p.recommendedAction}</td>
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
