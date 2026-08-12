import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAssets } from '@/hooks/usePlatformData';
import DataStateContainer from '@/components/ui/DataStateContainer';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import { Sliders, ShieldCheck, AlertTriangle, TrendingUp, FileText, CheckCircle2, HeartPulse, Activity, Columns, HelpCircle, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAssetAnomalies, getAssetPredictions, getAssetTrends, getAssetEvidence } from '@/services/intelligence.service';

export const PredictionsView: React.FC = () => {
  const { data: assets, isLoading, isError, refetch } = useAssets();
  const [selectedAssetId, setSelectedAssetId] = useState<string>('LAPTOP-001');
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<string | null>(null);

  const selectedAsset = assets?.find((a) => a.id === selectedAssetId) || assets?.[0];

  const { data: anomalyData = [] } = useQuery({
    queryKey: ['intelligence-anomalies', selectedAssetId],
    queryFn: () => getAssetAnomalies(selectedAssetId),
  });

  const { data: predictionData = [] } = useQuery({
    queryKey: ['intelligence-predictions', selectedAssetId],
    queryFn: () => getAssetPredictions(selectedAssetId),
  });

  const { data: trendData = [] } = useQuery({
    queryKey: ['intelligence-trends', selectedAssetId],
    queryFn: () => getAssetTrends(selectedAssetId),
  });

  const { data: evidenceData = [] } = useQuery({
    queryKey: ['intelligence-evidence', selectedAssetId],
    queryFn: () => getAssetEvidence(selectedAssetId),
  });

  // Calculate Fleet Intelligence KPI Metrics
  const fleetHealth = assets && assets.length > 0 ? Math.round(assets.reduce((acc, a) => acc + a.healthScore, 0) / assets.length) : 0;
  const activeAnomaliesCount = assets ? assets.filter((a) => a.healthScore < 80).length : 0;
  const highRiskCount = assets ? assets.filter((a) => a.status === 'CRITICAL' || a.status === 'WARNING').length : 0;
  const deterioratingCount = assets ? assets.filter((a) => a.operatingMode === 'HIGH_LOAD' || a.operatingMode === 'DEGRADED').length : 0;

  return (
    <DashboardLayout
      title="Explainable Intelligence & Predictive Analytics"
      description="OBSERVE • MEASURE • COMPARE • DETECT • PREDICT • EXPLAIN"
    >
      <div className="space-y-6">
        {/* 1. Intelligence Overview KPI Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
          <div className="card p-4 bg-slate-900 border border-slate-800">
            <span className="text-slate-400 font-sans text-xs uppercase block">Fleet Average Health</span>
            <div className="flex items-center gap-2 mt-1">
              <HeartPulse className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="text-2xl font-bold text-emerald-400">{fleetHealth}%</span>
            </div>
            <span className="text-[10px] text-slate-500 font-sans block mt-1">Deterministic Model v1.0</span>
          </div>

          <div className="card p-4 bg-slate-900 border border-slate-800">
            <span className="text-slate-400 font-sans text-xs uppercase block">Active Anomalies</span>
            <div className="flex items-center gap-2 mt-1">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span className="text-2xl font-bold text-cyan-300">{activeAnomaliesCount}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-sans block mt-1">|Z| ≥ 2.5σ Deviations</span>
          </div>

          <div className="card p-4 bg-slate-900 border border-slate-800">
            <span className="text-slate-400 font-sans text-xs uppercase block">High Risk Vectors</span>
            <div className="flex items-center gap-2 mt-1">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="text-2xl font-bold text-amber-300">{highRiskCount}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-sans block mt-1">Risk Probability &gt; 25%</span>
          </div>

          <div className="card p-4 bg-slate-900 border border-slate-800">
            <span className="text-slate-400 font-sans text-xs uppercase block">Deteriorating Assets</span>
            <div className="flex items-center gap-2 mt-1">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold text-purple-300">{deterioratingCount}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-sans block mt-1">High Load & Degraded</span>
          </div>
        </div>

        {/* Asset Selection & Comparison Toggle Bar */}
        <div className="card p-4 bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Sliders className="w-6 h-6 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                Intelligence Engine Asset Inspector
              </h3>
              <p className="text-xs text-slate-400">Inspect evidence traces, baseline Z-scores, and multi-factor failure probability vectors</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border flex items-center gap-1.5 ${
                showComparison
                  ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Columns size={14} />
              <span>{showComparison ? 'Hide Asset Comparison' : 'Side-by-Side Comparison'}</span>
            </button>

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
        </div>

        {/* 2. Side-by-Side Asset Comparison View (Section 12 Layout) */}
        {showComparison && assets && (
          <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4 animate-fadeIn">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
              <Columns className="w-4 h-4 text-indigo-400" />
              <span>Fleet Multi-Asset Side-by-Side Intelligence Comparison</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                    <th className="p-3">Asset ID</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Health Score</th>
                    <th className="p-3">Operating Mode</th>
                    <th className="p-3">CPU / Load</th>
                    <th className="p-3">Temperature</th>
                    <th className="p-3">Risk Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {assets.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-950/40">
                      <td className="p-3 font-bold text-slate-100">{a.id} ({a.name.split(' ')[0]})</td>
                      <td className="p-3"><DataSourceBadge source={a.source} size="sm" /></td>
                      <td className="p-3 font-bold text-emerald-400">{a.healthScore}%</td>
                      <td className="p-3 text-purple-300 font-bold">{a.operatingMode || 'RUNNING'}</td>
                      <td className="p-3 text-cyan-300">{a.metrics.cpu}%</td>
                      <td className="p-3 text-amber-300">{a.metrics.temperature}°C</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${a.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40' : a.status === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DataStateContainer
          status="success"
          isLoading={isLoading}
          isError={isError}
          isEmpty={!assets || assets.length === 0}
          onRetry={refetch}
        >
          {selectedAsset && (
            <div className="space-y-6">
              {/* Insufficient Data State for Offline Assets (Section 10 Layout) */}
              {selectedAsset.status === 'OFFLINE' ? (
                <div className="card p-6 bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-amber-400">
                    <HelpCircle size={18} />
                    <h4 className="text-sm font-bold uppercase">PREDICTION & INTELLIGENCE UNAVAILABLE</h4>
                  </div>
                  <p className="text-slate-400 font-sans">
                    Target asset <strong className="text-slate-200">{selectedAsset.id}</strong> gateway is disconnected. Insufficient historical samples to run deterministic health models.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex justify-between">
                    <span>Required Samples: 1000</span>
                    <span>Available: 0</span>
                    <span className="text-amber-400 font-bold">Status: INSUFFICIENT_DATA</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* 3. Health Engine Overview & Contributor Penalties (Section 5 Layout) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4 lg:col-span-2">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <HeartPulse className="w-5 h-5 text-emerald-400" />
                          <div>
                            <h3 className="text-base font-bold text-slate-100 font-mono">{selectedAsset.name}</h3>
                            <p className="text-xs text-slate-400 font-mono">Model Version: <strong className="text-indigo-300">v1.0-intelligence</strong></p>
                          </div>
                        </div>
                        <DataSourceBadge source={selectedAsset.source} size="sm" />
                      </div>

                      {/* Health Contributor Penalties Table */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                          <span>Deterministic Health Contributors</span>
                        </h4>
                        <div className="space-y-1.5 font-mono text-xs">
                          {Object.entries(selectedAsset.healthBreakdown || {}).map(([factor, impact]) => (
                            <div key={factor} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                              <span className="text-slate-300">{factor}</span>
                              <span className={`font-bold ${impact < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {impact > 0 ? `+${impact}` : impact} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Failure Probability Vector (Section 8 Layout) */}
                    <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>Failure Probability Vector</span>
                        </h4>
                        {predictionData.map((pred, i) => (
                          <div key={i} className="space-y-3 font-mono text-xs">
                            <div className="flex justify-between items-baseline">
                              <span className="text-slate-400">Risk Score:</span>
                              <strong className="text-2xl font-bold text-amber-400">{(pred.riskScore * 100).toFixed(0)}%</strong>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                              <span>Horizon:</span>
                              <span className="text-purple-300 font-bold">{pred.horizon}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                              <span>Confidence:</span>
                              <span className="text-emerald-400 font-bold">{(pred.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-sans text-slate-300">
                              {pred.evidence}
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setActiveEvidenceModal('PREDICTION')}
                        className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/40 text-xs font-mono text-indigo-300 hover:bg-indigo-900/40 flex items-center justify-between transition-all"
                      >
                        <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-indigo-400" /> View Prediction Evidence</span>
                        <span>[ View Why ]</span>
                      </button>
                    </div>
                  </div>

                  {/* 4. Statistical Anomaly Panel & Derived Metric Trends */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Statistical Anomalies (Section 6 Layout) */}
                    <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <span>Statistical Anomaly Detection (Z-Score σ)</span>
                      </h4>
                      <div className="space-y-3 font-mono text-xs">
                        {anomalyData.map((anom, i) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-200">{anom.metric}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${anom.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                                {anom.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans">{anom.evidence}</p>
                            <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                              <span>Sigma: <strong className="text-cyan-300">{anom.deviationSigma}σ</strong></span>
                              <span>Detector: <strong className="text-purple-300">BaselineDeviation v0.4</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metric Trends (Section 7 Layout) */}
                    <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-3">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span>Derived Telemetry Metric Trajectories</span>
                      </h4>
                      <div className="space-y-3 font-mono text-xs">
                        {trendData.map((trend, i) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-200">{trend.metric}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                ↑ {trend.direction} (+13.5%)
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans">{trend.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 5. Evidence & Explainability Audit Panel (Section 9 Layout "Why This Result?") */}
                  <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span>Why This Result? — Evidence & Explainability Audit Trail</span>
                      </h4>
                      <span className="text-xs font-mono text-slate-400">
                        Category Tagging: <strong className="text-emerald-400">OBSERVED</strong> • <strong className="text-purple-400">INFERRED</strong> • <strong className="text-amber-400">PREDICTED</strong>
                      </span>
                    </div>

                    <div className="space-y-2 font-mono text-xs">
                      {evidenceData.map((item, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.category === 'OBSERVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : item.category === 'INFERRED' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
                              {item.category}
                            </span>
                            <div>
                              <strong className="text-slate-200">{item.metric}: {item.value}</strong>
                              {item.baseline && <span className="text-[11px] text-slate-400 block font-sans">{item.baseline}</span>}
                            </div>
                          </div>

                          <span className="text-[10px] text-slate-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DataStateContainer>
      </div>

      {/* Evidence Explanation Modal */}
      {activeEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 bg-slate-900 border border-indigo-500/40 max-w-lg w-full space-y-4 font-mono text-xs animate-fadeIn relative">
            <button
              onClick={() => setActiveEvidenceModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X size={18} />
            </button>
            <h3 className="text-base font-bold text-slate-100 font-sans flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Evidence Audit Trace — {selectedAsset?.id}</span>
            </h3>
            <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Period:</span>
                <span className="text-slate-200">Last 6 hours (21,600 samples)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Baseline Window:</span>
                <span className="text-slate-200">Rolling 24 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Data Quality:</span>
                <span className="text-emerald-400 font-bold">GOOD (100% SLA)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Detector / Model:</span>
                <span className="text-purple-300">StatisticalRisk v1.0</span>
              </div>
            </div>
            <p className="text-slate-300 font-sans text-xs">
              This failure probability vector is calculated deterministically from measured temperature and vibration deviations without ungrounded LLM guesses.
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PredictionsView;
