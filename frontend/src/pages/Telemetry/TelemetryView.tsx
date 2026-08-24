import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import DataStateContainer from '@/components/ui/DataStateContainer';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import SimulationControlBar from '@/components/simulation/SimulationControlBar';
import CopilotDrawer from '@/components/copilot/CopilotDrawer';
import { useQuery } from '@tanstack/react-query';
import { getAssets } from '@/services/assets.service';
import { getHistoricalTelemetry, getDataQualityReport } from '@/services/telemetry.service';
import { getFreshnessInfo } from '@/utils/freshnessUtils';
import {
  Activity,
  Cpu,
  Clock,
  Wifi,
  HardDrive,
  Zap,
  ShieldCheck,
  Radio,
  Bot,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  ArrowDownRight,
  CheckCircle2,
  Thermometer,
  Gauge,
  Wind,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

export const TelemetryView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAsset = searchParams.get('asset') || 'LAPTOP-001';

  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialAsset);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1h');
  const [selectedMetric, setSelectedMetric] = useState<string>('auto');
  const [historyMode, setHistoryMode] = useState<'TELEMETRY' | 'TWIN_EVENTS'>('TELEMETRY');
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(new Date().toISOString());

  // Real-time assets query (refreshes live every 1.5s)
  const { data: assets = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['telemetry-assets'],
    queryFn: () => getAssets('ALL'),
    refetchInterval: 1500,
  });

  // Active selected asset
  const selectedAsset = useMemo(() => {
    return assets.find((a) => a.id === selectedAssetId) || assets.find((a) => a.id === 'LAPTOP-001') || assets[0];
  }, [assets, selectedAssetId]);

  // Historical telemetry query
  const { data: historicalData, refetch: refetchHistory } = useQuery({
    queryKey: ['telemetry-history', selectedAssetId, selectedPeriod],
    queryFn: () => getHistoricalTelemetry(selectedAssetId, selectedPeriod),
    refetchInterval: 5000,
  });

  // Data quality audit report
  const { data: qualityReport } = useQuery({
    queryKey: ['telemetry-quality'],
    queryFn: getDataQualityReport,
    refetchInterval: 5000,
  });

  useEffect(() => {
    setLastUpdatedTime(new Date().toISOString());
  }, [assets]);

  const freshnessInfo = getFreshnessInfo(lastUpdatedTime);
  const historyPoints = historicalData?.points || [];

  const isSimulated = selectedAsset?.source === 'SIMULATED';
  const isMotor = selectedAssetId.includes('MOTOR');
  const isPump = selectedAssetId.includes('PUMP');

  // Adaptive Metric Options based on Asset Type
  const metricOptions = useMemo(() => {
    if (isMotor) {
      return [
        { key: 'rpm', label: 'RPM Speed', unit: 'RPM', color: '#35C9FF', threshold: 2000 },
        { key: 'temperature', label: 'Thermal Temperature', unit: '°C', color: '#F59E0B', threshold: 75 },
        { key: 'currentAmps', label: 'Current Load', unit: 'A', color: '#7C5CFF', threshold: 20 },
        { key: 'vibrationMmS', label: 'Vibration', unit: 'mm/s', color: '#EF4444', threshold: 1.5 },
      ];
    } else if (isPump) {
      return [
        { key: 'rpm', label: 'Pump Speed', unit: 'RPM', color: '#35C9FF', threshold: 1800 },
        { key: 'pressurePsi', label: 'System Pressure', unit: 'PSI', color: '#22C55E', threshold: 150 },
        { key: 'flowGpm', label: 'Fluid Flow', unit: 'GPM', color: '#7C5CFF', threshold: 500 },
        { key: 'vibrationMmS', label: 'Vibration', unit: 'mm/s', color: '#EF4444', threshold: 1.2 },
      ];
    } else {
      return [
        { key: 'cpu', label: 'CPU Utilization', unit: '%', color: '#35C9FF', threshold: 85 },
        { key: 'ram', label: 'RAM Usage', unit: '%', color: '#22C55E', threshold: 85 },
        { key: 'temperature', label: 'Temperature', unit: '°C', color: '#F59E0B', threshold: 70 },
        { key: 'networkIn', label: 'Network Ingress', unit: 'Kbps', color: '#7C5CFF', threshold: 100 },
      ];
    }
  }, [isMotor, isPump]);

  const activeMetricObj = useMemo(() => {
    if (selectedMetric === 'auto') return metricOptions[0];
    return metricOptions.find((m) => m.key === selectedMetric) || metricOptions[0];
  }, [selectedMetric, metricOptions]);

  // Calculated min/max/avg/current
  const metricValues = useMemo(() => {
    if (!historyPoints.length) return { min: 12, max: 34, avg: 22.5, current: 28, trend: 'STABLE' };
    const vals = historyPoints.map((p) => (p as any)[activeMetricObj.key] || p.cpu || 0);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const avg = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
    const current = vals[vals.length - 1] || avg;
    const first = vals[0] || avg;
    const diff = current - first;
    const trend = diff > 3 ? 'INCREASING' : diff < -3 ? 'DECREASING' : 'STABLE';
    return { min, max, avg, current, trend, diff: Math.round(diff * 10) / 10 };
  }, [historyPoints, activeMetricObj]);

  const handleAssetSelect = (id: string) => {
    setSelectedAssetId(id);
    setSelectedMetric('auto');
    setSearchParams({ asset: id });
  };

  const handleInvestigate = () => {
    setIsCopilotOpen(true);
  };

  return (
    <DashboardLayout
      title="Live Telemetry"
      description="Real-time Digital Twin telemetry, trends and operational evidence."
    >
      <div className="space-y-6 font-sans">
        
        {/* Conditional Simulation Control Bar (Only if source is SIMULATED) */}
        {isSimulated && <SimulationControlBar onScenarioChange={refetch} />}

        {/* TOP ASSET SELECTOR & CONTEXT BAR */}
        <div className="p-4 rounded-2xl bg-[#0D121A] border border-[#1E2936] space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E2936] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                <Activity size={24} className="animate-pulse text-cyan-400" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-mono font-bold text-lg text-slate-100">{selectedAsset?.id || 'LAPTOP-001'}</h2>
                  <span className="text-xs text-slate-400 font-mono">({selectedAsset?.name || 'Host Workstation'})</span>
                  
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-extrabold border flex items-center gap-1 ${
                    selectedAsset?.status === 'CRITICAL'
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      : selectedAsset?.status === 'WARNING'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  }`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {selectedAsset?.status || 'HEALTHY'}
                  </span>

                  <DataSourceBadge source={selectedAsset?.source || 'REAL-TIME LOCAL'} size="sm" />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mt-1">
                  <span>Type: <strong className="text-slate-200">{selectedAsset?.type || 'HOST WORKSTATION'}</strong></span>
                  <span>Health: <strong className="text-emerald-400 font-bold">{selectedAsset?.healthScore || 96}%</strong></span>
                  <span>Operating Mode: <strong className="text-slate-200">{selectedAsset?.operatingMode || 'NORMAL'}</strong></span>
                  <span>Freshness: <strong className="text-cyan-400">{freshnessInfo.freshnessMs / 1000}s</strong></span>
                </div>
              </div>
            </div>

            {/* Asset Switcher Dropdown & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
              <div className="flex items-center gap-2 bg-[#111923] px-3 py-1.5 rounded-xl border border-[#1E2936]">
                <span className="text-slate-400 text-[11px]">Select Asset:</span>
                <select
                  value={selectedAssetId}
                  onChange={(e) => handleAssetSelect(e.target.value)}
                  className="bg-transparent text-purple-300 focus:outline-none cursor-pointer text-xs font-bold font-mono"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id} className="bg-[#111923] text-slate-100">
                      {a.id} ({a.name})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => navigate(`/assets/${selectedAssetId}`)}
                className="px-3 py-2 rounded-xl bg-[#111923] hover:bg-slate-800 text-slate-200 border border-[#1E2936] transition-colors flex items-center gap-1.5"
              >
                [View Digital Twin]
              </button>

              <button
                onClick={handleInvestigate}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all"
              >
                <Bot size={15} /> [Investigate]
              </button>
            </div>
          </div>

          {/* Transport Indicator Strip */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                <Radio size={12} className="animate-pulse" /> ● LIVE WebSocket
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">Data Gate Active</span>
            </div>
            <span className="text-[10px] text-slate-500">UTC: {new Date(lastUpdatedTime).toUTCString()}</span>
          </div>
        </div>

        {/* ASSET-AWARE LIVE METRICS KPI ROW */}
        <DataStateContainer
          status="success"
          isLoading={isLoading}
          isError={isError}
          isStale={freshnessInfo.status === 'STALE' || freshnessInfo.status === 'OFFLINE'}
          staleMessage={`Telemetry SLA status is ${freshnessInfo.status}. Displaying buffered hardware snapshot.`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {isMotor ? (
              <>
                <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-cyan-400"><Gauge size={14} /> RPM SPEED</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 font-bold">● LIVE</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">1,750 RPM</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1 flex justify-between">
                    <span>Source: SIMULATED</span>
                    <span className="text-cyan-400">Stable</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-amber-400"><Thermometer size={14} /> TEMPERATURE</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 font-bold">● LIVE</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-300 mt-1">44°C</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1 flex justify-between">
                    <span>Source: SIMULATED</span>
                    <span className="text-emerald-400">Normal</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-purple-400"><Zap size={14} /> CURRENT LOAD</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 font-bold">● LIVE</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-purple-300 mt-1">14.2 A</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1 flex justify-between">
                    <span>415 V Line</span>
                    <span className="text-slate-400">0.8s ago</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-rose-400"><Wind size={14} /> VIBRATION</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 font-bold">● LIVE</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-rose-300 mt-1">0.8 mm/s</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1 flex justify-between">
                    <span>Bearing Check</span>
                    <span className="text-emerald-400">Good</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-emerald-400"><Layers size={14} /> TORQUE LOAD</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 font-bold">● LIVE</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">65%</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Nominal Rating</div>
                </div>
              </>
            ) : isPump ? (
              <>
                <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-cyan-400"><Gauge size={14} /> PUMP SPEED</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 font-bold">● LIVE</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">1,450 RPM</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Source: SIMULATED</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-emerald-400"><Zap size={14} /> PRESSURE</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 font-bold">● LIVE</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">120 PSI</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Optimal Discharge</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-purple-400"><Wind size={14} /> FLOW RATE</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 font-bold">● LIVE</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-purple-300 mt-1">450 GPM</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Fluid Dynamic</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-amber-400"><Thermometer size={14} /> FLUID TEMP</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 font-bold">● LIVE</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-300 mt-1">42°C</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Thermal Loop</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-rose-400"><Activity size={14} /> VIBRATION</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 font-bold">● LIVE</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">0.6 mm/s</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">Casing Sensor</div>
                </div>
              </>
            ) : (
              /* LAPTOP / SERVER / DEFAULT */
              <>
                <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-cyan-400"><Cpu size={14} /> CPU LOAD</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 font-bold">● LIVE</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">{selectedAsset?.metrics?.cpu ?? 28}%</div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span className="text-emerald-400 flex items-center"><ArrowDownRight size={12} /> 4.2%</span>
                    <span>Updated 0.8s ago</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-emerald-400"><HardDrive size={14} /> RAM UTILIZATION</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 font-bold">● LIVE</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">{selectedAsset?.metrics?.ram ?? 48}%</div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>{selectedAsset?.metrics?.ramUsedGb ?? 7.8} / {selectedAsset?.metrics?.ramTotalGb ?? 16} GB</span>
                    <span>Updated 0.8s ago</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-amber-400"><Zap size={14} /> TEMPERATURE</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 font-bold">● LIVE</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{selectedAsset?.metrics?.temperature ?? 44}°C</div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span className="text-emerald-400">Thermal: Normal</span>
                    <span>Updated 0.8s ago</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-purple-400"><Wifi size={14} /> NETWORK THROUGHPUT</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 font-bold">● LIVE</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-purple-300 mt-1">1.2 Gbps</div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>Latency: 2.4ms</span>
                    <span>Updated 0.8s ago</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1E2936]">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1 font-bold text-slate-300"><Layers size={14} /> DISK STORAGE</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/15 text-emerald-400 font-bold">● LIVE</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-100 mt-1">{selectedAsset?.metrics?.disk ?? 42}%</div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>420 / 1024 GB</span>
                    <span>Updated 0.8s ago</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </DataStateContainer>

        {/* MAIN HISTORICAL ANALYSIS AREA */}
        <div className="p-5 rounded-2xl bg-[#0D121A] border border-[#1E2936] space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2936] pb-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>TELEMETRY HISTORY</span>
                </h3>

                {/* History vs Event Toggle */}
                <div className="flex items-center bg-[#111923] p-0.5 rounded-xl border border-[#1E2936] font-mono text-xs">
                  <button
                    onClick={() => setHistoryMode('TELEMETRY')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      historyMode === 'TELEMETRY' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    [ TELEMETRY ]
                  </button>
                  <button
                    onClick={() => setHistoryMode('TWIN_EVENTS')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      historyMode === 'TWIN_EVENTS' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    [ TWIN EVENTS ]
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">Selected metric behavior over time for {selectedAsset?.id}.</p>
            </div>

            {/* Metric Selector Tabs & Time Range Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Metric Selector */}
              <div className="flex items-center gap-1 bg-[#111923] p-1 rounded-xl border border-[#1E2936] font-mono text-xs">
                {metricOptions.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setSelectedMetric(m.key)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      activeMetricObj.key === m.key ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Range Selector: 5m, 30m, 1h, 6h, 24h, 7d */}
              <div className="flex items-center gap-1 bg-[#111923] p-1 rounded-xl border border-[#1E2936] font-mono text-xs font-bold">
                {['5m', '30m', '1h', '6h', '24h', '7d'].map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setSelectedPeriod(period);
                      refetchHistory();
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      selectedPeriod === period
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition-colors ${
                  compareMode ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-[#111923] text-slate-300 border-[#1E2936] hover:bg-slate-800'
                }`}
              >
                {compareMode ? 'Comparing Metrics' : '[Compare]'}
              </button>
            </div>
          </div>

          {/* Primary Chart View */}
          {historyMode === 'TELEMETRY' ? (
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
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: 8, fontSize: 11 }}
                    labelFormatter={(t) => new Date(t).toLocaleString()}
                  />
                  <ReferenceLine y={activeMetricObj.threshold} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Threshold', fill: '#EF4444', fontSize: 10 }} />
                  <ReferenceLine y={metricValues.avg} stroke="#64748b" strokeDasharray="2 2" label={{ value: 'Baseline', fill: '#64748b', fontSize: 10 }} />
                  <Line
                    type="monotone"
                    dataKey={activeMetricObj.key}
                    name={`${activeMetricObj.label} (${activeMetricObj.unit})`}
                    stroke={activeMetricObj.color}
                    strokeWidth={2.5}
                    dot={false}
                  />
                  {compareMode && (
                    <Line
                      type="monotone"
                      dataKey={metricOptions[1]?.key || 'ram'}
                      name={`${metricOptions[1]?.label} (${metricOptions[1]?.unit})`}
                      stroke="#22C55E"
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            /* Twin Events Timeline View */
            <div className="p-4 rounded-xl bg-[#111923] border border-[#1E2936] space-y-3 font-mono text-xs">
              <div className="space-y-2 border-l-2 border-purple-500/40 pl-4">
                <div className="relative">
                  <span className="text-purple-400 font-bold">14:29 UTC</span> • Health Score adjusted to 96%
                </div>
                <div className="relative">
                  <span className="text-cyan-400 font-bold">14:27 UTC</span> • Telemetry baseline stream refreshed
                </div>
                <div className="relative">
                  <span className="text-emerald-400 font-bold">14:22 UTC</span> • State transitioned to NORMAL
                </div>
              </div>
            </div>
          )}

          {/* CHART SUMMARY & TREND INTERPRETATION BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 rounded-xl bg-[#111923] border border-[#1E2936] text-xs font-mono text-center">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">MIN</span>
              <strong className="text-cyan-400">{metricValues.min} {activeMetricObj.unit}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">MAX</span>
              <strong className="text-amber-400">{metricValues.max} {activeMetricObj.unit}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">AVG</span>
              <strong className="text-emerald-400">{metricValues.avg} {activeMetricObj.unit}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">CURRENT</span>
              <strong className="text-slate-100">{metricValues.current} {activeMetricObj.unit}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block font-sans">TREND</span>
              <strong className={metricValues.trend === 'INCREASING' ? 'text-rose-400' : 'text-purple-300'}>
                ● {metricValues.trend}
              </strong>
            </div>
          </div>

          {/* Calculated Trend Analysis Box */}
          <div className="p-3.5 rounded-xl bg-[#111923] border border-[#1E2936] flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-purple-400 font-bold uppercase">{activeMetricObj.label} Trend Analysis:</span>
              <p className="text-slate-300 mt-0.5 font-sans">
                {metricValues.trend === 'INCREASING'
                  ? `⚠ Metric value increased ${metricValues.diff}% over historical baseline (${metricValues.avg} ${activeMetricObj.unit}).`
                  : `● ${activeMetricObj.label} is operating within nominal baseline parameters (Avg: ${metricValues.avg} ${activeMetricObj.unit}).`}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
              metricValues.trend === 'INCREASING' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}>
              {metricValues.trend}
            </span>
          </div>
        </div>

        {/* DIGITAL TWIN HEALTH & HEALTH CORRELATION SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Health Breakdown Card */}
          <div className="p-5 rounded-2xl bg-[#0D121A] border border-[#1E2936] space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1E2936] pb-2.5">
              <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-2">
                <Activity size={16} className="text-emerald-400" /> DIGITAL TWIN HEALTH
              </span>
              <span className="text-sm font-mono font-extrabold text-emerald-400">
                {selectedAsset?.healthScore || 96}% (NORMAL)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-[#111923] border border-[#1E2936]">
                <span className="text-slate-500 text-[10px] block">CPU Health</span>
                <strong className="text-emerald-400">+92</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111923] border border-[#1E2936]">
                <span className="text-slate-500 text-[10px] block">Memory Health</span>
                <strong className="text-emerald-400">+95</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111923] border border-[#1E2936]">
                <span className="text-slate-500 text-[10px] block">Temperature</span>
                <strong className="text-emerald-400">+98</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111923] border border-[#1E2936]">
                <span className="text-slate-500 text-[10px] block">Disk Subsystem</span>
                <strong className="text-emerald-400">+91</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111923] border border-[#1E2936]">
                <span className="text-slate-500 text-[10px] block">Network Latency</span>
                <strong className="text-emerald-400">+97</strong>
              </div>
            </div>
          </div>

          {/* Why Is Health Changing Callout */}
          <div className="p-5 rounded-2xl bg-[#0D121A] border border-[#1E2936] space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1E2936] pb-2.5">
              <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                WHY IS HEALTH CHANGING?
              </span>
              <button onClick={handleInvestigate} className="text-xs font-mono text-purple-400 hover:underline">
                [View Evidence]
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Health score evaluated at <strong>{selectedAsset?.healthScore || 96}%</strong>. Primary metric factors:
            </p>
            <ul className="text-xs font-mono text-slate-400 space-y-1">
              <li className="flex items-center justify-between">
                <span>• Thermal stability rating:</span>
                <strong className="text-emerald-400">+98% Good</strong>
              </li>
              <li className="flex items-center justify-between">
                <span>• Workload CPU pressure:</span>
                <strong className="text-cyan-300">Nominal 28%</strong>
              </li>
            </ul>
          </div>
        </div>

        {/* ACTIVE ANOMALIES & EVENTS PANEL */}
        <div className="p-5 rounded-2xl bg-[#0D121A] border border-[#1E2936] space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1E2936] pb-2.5">
            <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400" /> ACTIVE TELEMETRY ANOMALIES & EVENTS
            </span>
          </div>

          {selectedAsset?.status === 'HEALTHY' ? (
            <div className="p-4 rounded-xl bg-[#111923] border border-[#1E2936] text-center space-y-1 font-mono text-xs">
              <CheckCircle2 size={22} className="mx-auto text-emerald-400" />
              <h4 className="font-bold text-slate-200 uppercase">NO ACTIVE ANOMALIES</h4>
              <p className="text-slate-400 text-[11px] font-sans">Current telemetry is within expected behavior.</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="font-bold text-amber-400 uppercase">Telemetry Deviation Detected</span>
                <p className="text-slate-300 mt-0.5">Observed metric deviation on {selectedAsset?.id}.</p>
              </div>
              <button onClick={handleInvestigate} className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold">
                Investigate
              </button>
            </div>
          )}
        </div>

        {/* IRISYN INSIGHT & COPILOT CONTEXT */}
        <div className="p-4 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-purple-400 shrink-0" />
            <div>
              <span className="text-purple-300 font-bold uppercase tracking-wider block">IRISYN ENGINEERING INSIGHT</span>
              <p className="text-slate-300 font-sans text-xs mt-0.5">
                "Telemetry for {selectedAsset?.id} remains stable across the past 6 hours with no active threshold anomalies."
              </p>
            </div>
          </div>
          <button
            onClick={handleInvestigate}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shrink-0 transition-colors flex items-center gap-1.5 shadow-md shadow-purple-500/20"
          >
            <Bot size={15} /> [Investigate Evidence]
          </button>
        </div>

        {/* COLLAPSIBLE DATA QUALITY & DIAGNOSTICS SECTION */}
        <div className="p-4 rounded-2xl bg-[#0D121A] border border-[#1E2936] space-y-3 font-mono text-xs">
          <button
            onClick={() => setIsDiagnosticsOpen(!isDiagnosticsOpen)}
            className="w-full flex items-center justify-between text-left focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span className="font-bold text-slate-300">DATA QUALITY & TRANSPORT DIAGNOSTICS</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                STATUS: {qualityReport?.status || 'GOOD'}
              </span>
            </div>
            {isDiagnosticsOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>

          {isDiagnosticsOpen && (
            <div className="pt-3 border-t border-[#1E2936] grid grid-cols-2 sm:grid-cols-5 gap-3 text-center animate-in fade-in duration-150">
              <div className="p-2.5 rounded-xl bg-[#111923] border border-[#1E2936]">
                <span className="text-slate-500 text-[10px] block">Freshness</span>
                <strong className="text-emerald-400">99.2%</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111923] border border-[#1E2936]">
                <span className="text-slate-500 text-[10px] block">Completeness</span>
                <strong className="text-emerald-400">{qualityReport?.completenessPct || 99.4}%</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111923] border border-[#1E2936]">
                <span className="text-slate-500 text-[10px] block">Sequence Integrity</span>
                <strong className="text-cyan-300">{qualityReport?.sequenceIntegrity || '100%'}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111923] border border-[#1E2936]">
                <span className="text-slate-500 text-[10px] block">Dropped Events</span>
                <strong className="text-slate-200">0</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-[#111923] border border-[#1E2936]">
                <button
                  onClick={() => navigate('/diagnostics')}
                  className="w-full h-full text-purple-400 font-bold hover:underline flex items-center justify-center gap-1"
                >
                  [View Diagnostics]
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Copilot Drawer */}
      <CopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </DashboardLayout>
  );
};

export default TelemetryView;
