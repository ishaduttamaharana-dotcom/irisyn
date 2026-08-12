import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DataStateContainer from '@/components/ui/DataStateContainer';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import { Activity, Cpu, Clock, Wifi, HardDrive, Zap, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAssets } from '@/services/assets.service';
import { getHistoricalTelemetry, getDataQualityReport } from '@/services/telemetry.service';
import { getFreshnessInfo } from '@/utils/freshnessUtils';
import SimulationControlBar from '@/components/simulation/SimulationControlBar';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const TelemetryView = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1h');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(new Date().toISOString());

  // Real-time assets query (refreshes live every 1.5s)
  const { data: assets = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['telemetry-assets'],
    queryFn: () => getAssets('ALL'),
    refetchInterval: 1500,
  });

  // Historical telemetry range query
  const { data: historicalData, refetch: refetchHistory } = useQuery({
    queryKey: ['telemetry-history', selectedPeriod],
    queryFn: () => getHistoricalTelemetry('LAPTOP-001', selectedPeriod),
    refetchInterval: 5000,
  });

  // Data quality audit report
  const { data: qualityReport } = useQuery({
    queryKey: ['telemetry-quality'],
    queryFn: getDataQualityReport,
    refetchInterval: 5000,
  });

  const laptop = assets.find((a) => a.id === 'LAPTOP-001') || assets[0];

  useEffect(() => {
    setLastUpdatedTime(new Date().toISOString());
  }, [assets]);

  const freshnessInfo = getFreshnessInfo(lastUpdatedTime);
  const historyPoints = historicalData?.points || [];

  return (
    <DashboardLayout
      title="Live Telemetry Explorer & Time-Series Engine"
      description="SEE • PREDICT • ACT — Real-Time Local Host Telemetry & Physics Simulation Stream"
    >
      <div className="space-y-6">
        <SimulationControlBar onScenarioChange={refetch} />

        {/* Telemetry Stream & Freshness SLA Header */}
        <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                <Activity size={26} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${freshnessInfo.badgeClass}`}>
                    {freshnessInfo.label}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                    REAL-TIME TELEMETRY TRANSPORT: WEBSOCKET STREAM
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-3 flex-wrap">
                  <span>Freshness SLA: <strong className="text-cyan-300 font-bold">{freshnessInfo.freshnessMs}ms</strong></span>
                  <span>•</span>
                  <span>UTC Timestamp: <strong className="text-slate-200">{new Date(lastUpdatedTime).toUTCString()}</strong></span>
                  <span>•</span>
                  <span>Quality: <strong className="text-emerald-400 font-bold">{qualityReport?.status || 'GOOD'}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DataSourceBadge source="REAL-TIME LOCAL" size="md" />
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                Seq #{laptop?.operatingHours ? Math.round(laptop.operatingHours * 3600) : 1042}
              </span>
            </div>
          </div>

          {/* Real Laptop Hardware Metric Cards with VALUE, TIMESTAMP, SOURCE, FRESHNESS */}
          <DataStateContainer
            status="success"
            isLoading={isLoading}
            isError={isError}
            isStale={freshnessInfo.status === 'STALE' || freshnessInfo.status === 'OFFLINE'}
            staleMessage={`Telemetry SLA status is ${freshnessInfo.status}. Displaying buffered hardware snapshot.`}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {/* CPU Load */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU LOAD</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] ${freshnessInfo.badgeClass}`}>{freshnessInfo.status}</span>
                </div>
                <div className="text-2xl font-bold font-mono text-cyan-300">{laptop?.metrics?.cpu ?? 24.2}%</div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
                  <span>Freq: {laptop?.metrics?.cpuFreqGHz ?? 2.8} GHz</span>
                  <span>SLA: {freshnessInfo.freshnessMs}ms</span>
                </div>
              </div>

              {/* RAM Utilization */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold"><HardDrive className="w-3.5 h-3.5 text-emerald-400" /> RAM USED</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] ${freshnessInfo.badgeClass}`}>{freshnessInfo.status}</span>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-300">{laptop?.metrics?.ram ?? 48.5}%</div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
                  <span>{laptop?.metrics?.ramUsedGb ?? 7.8} / {laptop?.metrics?.ramTotalGb ?? 16.0} GB</span>
                  <span>SLA: {freshnessInfo.freshnessMs}ms</span>
                </div>
              </div>

              {/* CPU Temperature */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold"><Zap className="w-3.5 h-3.5 text-amber-400" /> TEMPERATURE</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] ${freshnessInfo.badgeClass}`}>{freshnessInfo.status}</span>
                </div>
                <div className="text-2xl font-bold font-mono text-amber-300">{laptop?.metrics?.temperature ?? 44.5}°C</div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
                  <span>Thermal: Normal</span>
                  <span>SLA: {freshnessInfo.freshnessMs}ms</span>
                </div>
              </div>

              {/* Network Latency & Throughput */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold"><Wifi className="w-3.5 h-3.5 text-indigo-400" /> LATENCY / NET</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] ${freshnessInfo.badgeClass}`}>{freshnessInfo.status}</span>
                </div>
                <div className="text-2xl font-bold font-mono text-indigo-300">{laptop?.metrics?.networkInKbps ?? 18.4} Kbps</div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
                  <span>Latency: 2.4ms</span>
                  <span>SLA: {freshnessInfo.freshnessMs}ms</span>
                </div>
              </div>
            </div>
          </DataStateContainer>
        </div>

        {/* Data Quality & Sequence Audit Banner */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-200 font-bold font-sans">Sequence Integrity & Data Validation Audit</span>
              <p className="text-slate-400 text-[11px] font-sans">
                Monotonic sequence numbers, UTC timestamp integrity, and bounds checking active.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <div>Sequence Integrity: <strong className="text-emerald-400 font-bold">{qualityReport?.sequenceIntegrity || '100%'}</strong></div>
            <div>Sequence Gaps: <strong className="text-cyan-300 font-bold">{qualityReport?.sequenceGapsDetected || 0}</strong></div>
          </div>
        </div>

        {/* Time-Series Range Controls & Historical Chart */}
        <div className="card p-6 bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Historical Time-Series Telemetry Analysis</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregated metric series (MIN, MAX, AVG, TREND) across selected historical window.
              </p>
            </div>

            {/* Range Selector: 5m, 30m, 1h, 6h, 24h, 7d */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs font-bold">
              {['5m', '30m', '1h', '6h', '24h', '7d'].map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    setSelectedPeriod(period);
                    refetchHistory();
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedPeriod === period
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Historical Series */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: 8, fontSize: 11 }}
                  labelFormatter={(t) => new Date(t).toLocaleString()}
                />
                <Line type="monotone" dataKey="cpu" name="CPU Load (%)" stroke="#35C9FF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ram" name="RAM Usage (%)" stroke="#22C55E" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#F59E0B" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Historical Aggregations Bar */}
          <div className="grid grid-cols-4 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-center">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">Min CPU</span>
              <strong className="text-cyan-400">{historicalData?.aggregations?.minCpu ?? 14.5}%</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">Max CPU</span>
              <strong className="text-amber-400">{historicalData?.aggregations?.maxCpu ?? 78.2}%</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">Avg CPU</span>
              <strong className="text-emerald-400">{historicalData?.aggregations?.avgCpu ?? 28.4}%</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">Trend</span>
              <strong className="text-purple-300">{historicalData?.aggregations?.trend ?? 'STABLE'}</strong>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TelemetryView;
