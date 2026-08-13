import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  Server,
  Database,
  Terminal,
  RotateCcw,
  Plus,
  Layers,
  Zap,
  AlertTriangle,
  Search,
  RefreshCw
} from 'lucide-react';
import {
  getDeploymentInfo,
  getBackupSnapshots,
  createBackupSnapshot,
  executeRollback,
  getSystemLogs,
  getPerformanceMetrics,
  getReleaseInfo,
  DeploymentInfo,
  BackupSnapshot,
  LogEntry,
  PerformanceMetrics,
  ReleaseInfo
} from '@/services/deployment.service';

const DeploymentView = () => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SERVICES' | 'LOGS' | 'BACKUP' | 'PERFORMANCE'>('OVERVIEW');
  
  const [deployInfo, setDeployInfo] = useState<DeploymentInfo | null>(null);
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [perfMetrics, setPerfMetrics] = useState<PerformanceMetrics | null>(null);
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null);

  const [loading, setLoading] = useState(false);
  const [rollbackMessage, setRollbackMessage] = useState<string | null>(null);

  // Log Viewer Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedService, setSelectedService] = useState<string>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [info, snaps, systemLogs, perf, rel] = await Promise.all([
        getDeploymentInfo(),
        getBackupSnapshots(),
        getSystemLogs(),
        getPerformanceMetrics(),
        getReleaseInfo(),
      ]);
      setDeployInfo(info);
      setSnapshots(snaps);
      setLogs(systemLogs);
      setPerfMetrics(perf);
      setReleaseInfo(rel);
    } catch (e) {
      console.warn('Failed to load deployment operations data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const newSnap = await createBackupSnapshot('On-demand production backup snapshot');
      setSnapshots((prev) => [newSnap, ...prev]);
    } catch (e) {
      console.warn('Create backup error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (snapId: string) => {
    setLoading(true);
    try {
      const res = await executeRollback(snapId);
      setRollbackMessage(res.message || `Rollback executed successfully to snapshot ${snapId}`);
    } catch (e) {
      console.warn('Rollback error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Logs Memo
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.requestId && log.requestId.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
      const matchesService = selectedService === 'ALL' || log.service === selectedService;
      return matchesSearch && matchesLevel && matchesService;
    });
  }, [logs, searchQuery, selectedLevel, selectedService]);

  return (
    <DashboardLayout
      title="IRISYN Deployment & Reliability Control Center"
      description="IS THE SYSTEM UP? • WHAT IS HEALTHY? • WHAT FAILED? • WHAT CHANGED? • CAN IT RECOVER?"
    >
      <div className="space-y-6 font-sans">
        {/* Environment & Mode Banner (Section 12) */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-lg font-mono">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-600 text-white shadow-lg shadow-cyan-500/30">
              <Server size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 tracking-tight uppercase">
                  ENVIRONMENT: {deployInfo?.environment || 'DEMO'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  ● DEMO MODE — SIMULATED DATA ENABLED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Version: <strong className="text-purple-300 font-mono">{deployInfo?.releaseVersion || 'v1.0.0-phase7'}</strong> • Commit:{' '}
                <strong className="text-cyan-300 font-mono">{deployInfo?.commitHash || 'a81d23f'}</strong> • Last Deploy:{' '}
                <strong className="text-slate-200 font-mono">Today at 17:42 UTC</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData()}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={13} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>

        {/* Rollback Message Banner */}
        {rollbackMessage && (
          <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/50 flex justify-between items-center font-mono text-xs text-purple-300">
            <span>✓ {rollbackMessage}</span>
            <button onClick={() => setRollbackMessage(null)} className="text-slate-400 hover:text-slate-200 font-bold">Dismiss</button>
          </div>
        )}

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono pb-1 border-b border-slate-800 scrollbar-none">
          {[
            { id: 'OVERVIEW', label: 'Operations Overview' },
            { id: 'SERVICES', label: 'Services & Recovery' },
            { id: 'LOGS', label: 'Dense Engineering Logs' },
            { id: 'BACKUP', label: 'Backup & Release Control' },
            { id: 'PERFORMANCE', label: 'Real Performance Metrics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-xl font-bold transition-all border-t border-x ${activeTab === tab.id ? 'bg-slate-900 text-purple-300 border-purple-500/50 border-b-slate-900 shadow-md' : 'bg-slate-950 text-slate-400 border-transparent hover:text-slate-200'}`}
            >
              [ {tab.label} ]
            </button>
          ))}
        </div>

        {/* TAB 1: OPERATIONS OVERVIEW (SECTION 4, 5, 11, 13) */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Compact System Health Cards (Section 5) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              <div className="card p-4 bg-slate-900 border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase text-[10px]">REST API GATEWAY</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ● ONLINE
                  </span>
                </div>
                <strong className="text-xl text-slate-100 font-bold block">42 ms</strong>
                <span className="text-[10px] text-slate-500 block">Measured Response Latency</span>
              </div>

              <div className="card p-4 bg-slate-900 border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase text-[10px]">POSTGRESQL DB</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ● ONLINE
                  </span>
                </div>
                <strong className="text-xl text-cyan-300 font-bold block">8 ms</strong>
                <span className="text-[10px] text-slate-500 block">JDBC Connection Latency</span>
              </div>

              <div className="card p-4 bg-slate-900 border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase text-[10px]">WEBSOCKET STREAM</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ● ONLINE
                  </span>
                </div>
                <strong className="text-xl text-purple-300 font-bold block">Connected</strong>
                <span className="text-[10px] text-slate-500 block">WSS /ws/telemetry Channel</span>
              </div>

              <div className="card p-4 bg-slate-900 border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 uppercase text-[10px]">LIVE TELEMETRY</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ● LIVE
                  </span>
                </div>
                <strong className="text-xl text-emerald-400 font-bold block">128 events/s</strong>
                <span className="text-[10px] text-slate-500 block">Host Telemetry Throughput</span>
              </div>
            </div>

            {/* Service Failure & Graceful Degradation State Banner (Section 11) */}
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle size={18} />
                  <span>SERVICE DEGRADED: PREDICTION ENGINE</span>
                </div>
                <span className="text-[10px] text-amber-400/80 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                  ISOLATED DEGRADATION
                </span>
              </div>
              <p className="text-slate-200 font-sans text-xs">
                Prediction Engine is currently running in fallback rule mode. <strong>Impact:</strong> Predictive risk models are degraded to Z-score anomaly rules.
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-500/20 text-[11px]">
                <div className="text-slate-400 font-sans">
                  Still fully operational: <strong className="text-emerald-400">Telemetry Stream</strong>, <strong className="text-emerald-400">Digital Twin (3D)</strong>, <strong className="text-emerald-400">Health Scoring</strong>, <strong className="text-emerald-400">Alerts & Incidents</strong>.
                </div>
                <a href="/diagnostics" className="text-cyan-300 hover:underline font-bold">
                  [ View System Diagnostics &rarr; ]
                </a>
              </div>
            </div>

            {/* CI/CD Pipeline Visualizer (Section 13) */}
            <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Layers size={16} className="text-purple-400" />
                  AUTOMATED CI/CD DEPLOYMENT PIPELINE (SECTION 13)
                </h4>
                <span className="text-[10px] text-emerald-400">Pipeline Status: DEPLOYED</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs font-mono">
                {[
                  { stage: 'Source', status: '✓ PASS' },
                  { stage: 'Lint', status: '✓ PASS' },
                  { stage: 'Type Check', status: '✓ PASS' },
                  { stage: 'Unit Tests', status: '✓ PASS' },
                  { stage: 'Build', status: '✓ PASS' },
                  { stage: 'Deploy', status: '✓ PASS' },
                  { stage: 'Health Check', status: 'LIVE' },
                ].map((stg) => (
                  <div key={stg.stage} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[10px]">{stg.stage}</span>
                    <strong className="text-emerald-400 block text-xs">{stg.status}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SERVICES & RECOVERY (SECTION 7 & 10) */}
        {activeTab === 'SERVICES' && (
          <div className="space-y-6">
            {/* 14-Service Registry */}
            <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono text-xs">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Server size={16} className="text-cyan-400" />
                SERVICE REGISTRY OPERATIONAL STATUS (SECTION 7)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { name: 'REST API Gateway', status: 'ONLINE', latency: '42 ms' },
                  { name: 'Telemetry Collector', status: 'LIVE', latency: '18 ms' },
                  { name: 'WebSocket Transport', status: 'ONLINE', latency: '28 ms' },
                  { name: 'PostgreSQL Database', status: 'ONLINE', latency: '8 ms' },
                  { name: 'Digital Twin Engine', status: 'ONLINE', latency: '14 ms' },
                  { name: 'Health Scoring Engine', status: 'ONLINE', latency: '16 ms' },
                  { name: 'Anomaly Detector', status: 'ONLINE', latency: '22 ms' },
                  { name: 'Prediction Engine', status: 'DEGRADED', latency: '85 ms' },
                  { name: 'Copilot Engineering Agent', status: 'ONLINE', latency: '28 ms' },
                  { name: 'Industrial Simulator', status: 'READY', latency: '5 ms' },
                  { name: 'Alerts Dispatcher', status: 'ONLINE', latency: '10 ms' },
                  { name: 'Maintenance Work Orders', status: 'ONLINE', latency: '12 ms' },
                  { name: 'MQTT Edge Adapter', status: 'TARGET_FUTURE', latency: 'N/A' },
                  { name: 'OPC-UA Gateway', status: 'TARGET_FUTURE', latency: 'N/A' },
                ].map((srv) => (
                  <div key={srv.name} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <div>
                      <strong className="text-slate-100 block">{srv.name}</strong>
                      <span className="text-[10px] text-slate-500">Latency: {srv.latency}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${srv.status === 'ONLINE' || srv.status === 'LIVE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : srv.status === 'DEGRADED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      ● {srv.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recovery Panel (Section 10) */}
            <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono text-xs">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <RotateCcw size={16} className="text-purple-400" />
                AUTOMATED RECOVERY STATUS & RESYNCHRONIZATION (SECTION 10)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">DATABASE PERSISTENCE:</span>
                  <strong className="text-emerald-400 font-bold block">● HEALTHY</strong>
                  <span className="text-[10px] text-slate-500">Automatic Connection Re-pool</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">TELEMETRY RE-CONNECTOR:</span>
                  <strong className="text-emerald-400 font-bold block">● LIVE</strong>
                  <span className="text-[10px] text-slate-500">Host Telemetry Active</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] block">WEBSOCKET BACKOFF RE-SYNC:</span>
                  <strong className="text-cyan-300 font-bold block">● CONNECTED</strong>
                  <span className="text-[10px] text-slate-500">Last event: Reconnected 17:21</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DENSE ENGINEERING LOGS (SECTION 8) */}
        {activeTab === 'LOGS' && (
          <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Terminal size={16} className="text-emerald-400" />
                DENSE ENGINEERING SYSTEM LOGS (SECTION 8)
              </h4>

              {/* Filter Controls Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search logs or trace IDs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs w-48 font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs font-mono"
                >
                  <option value="ALL">Severity: ALL</option>
                  <option value="INFO">Level: INFO</option>
                  <option value="WARN">Level: WARN</option>
                  <option value="ERROR">Level: ERROR</option>
                </select>

                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs font-mono"
                >
                  <option value="ALL">Service: ALL</option>
                  <option value="API Gateway">API Gateway</option>
                  <option value="Telemetry Collector">Telemetry Collector</option>
                  <option value="Prediction Engine">Prediction Engine</option>
                  <option value="Database">Database</option>
                  <option value="WebSocket (/ws)">WebSocket (/ws)</option>
                  <option value="Deployment">Deployment</option>
                </select>
              </div>
            </div>

            {/* Dense Engineering Logs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-purple-300">
                    <th className="py-2.5 px-3 uppercase w-24">TIME</th>
                    <th className="py-2.5 px-3 uppercase w-40">SERVICE</th>
                    <th className="py-2.5 px-3 uppercase w-20">LEVEL</th>
                    <th className="py-2.5 px-3 uppercase">MESSAGE</th>
                    <th className="py-2.5 px-3 uppercase w-32">REQUEST ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/60 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400">{log.timestamp}</td>
                      <td className="py-2.5 px-3 font-bold text-cyan-300">{log.service}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.level === 'INFO' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : log.level === 'WARN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-xs">{log.message}</td>
                      <td className="py-2.5 px-3 text-slate-500 text-[10px]">{log.requestId || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: BACKUP & RELEASE CONTROL (SECTION 9 & 14) */}
        {activeTab === 'BACKUP' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backup Panel (Section 9) */}
            <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Database size={16} className="text-purple-400" />
                  DATABASE BACKUP SNAPSHOTS (SECTION 9)
                </h4>
                <button
                  onClick={handleCreateBackup}
                  disabled={loading}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus size={14} />
                  <span>[ Run Backup ]</span>
                </button>
              </div>

              <div className="space-y-3">
                {snapshots.map((snap) => (
                  <div key={snap.snapshotId} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-100">{snap.snapshotId}</strong>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        ● VERIFIED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">{snap.description}</p>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-900 text-[10px] text-slate-500">
                      <span>Size: {(snap.sizeBytes / 1024 / 1024).toFixed(1)} MB</span>
                      <button
                        onClick={() => handleRollback(snap.snapshotId)}
                        className="px-2.5 py-1 rounded bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 font-bold transition-colors"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Release View & Rollback (Section 14) */}
            <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono text-xs">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <RotateCcw size={16} className="text-cyan-400" />
                RELEASE MANAGEMENT & ROLLBACK CONTROL (SECTION 14)
              </h4>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">CURRENT RELEASE:</span>
                  <strong className="text-purple-300 font-bold">{releaseInfo?.currentVersion || 'v1.0.0-phase7'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">PREVIOUS RELEASE:</span>
                  <strong className="text-slate-300">{releaseInfo?.previousVersion || 'v0.9.2'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">COMMIT HASH:</span>
                  <strong className="text-cyan-300">{releaseInfo?.commitHash || 'a81d23f'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RELEASE DATE:</span>
                  <strong className="text-slate-200">13 Aug 2026</strong>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => handleRollback('v0.9.2')}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={14} />
                    <span>Rollback to v0.9.2</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: REAL PERFORMANCE METRICS (SECTION 15) */}
        {activeTab === 'PERFORMANCE' && (
          <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono text-xs">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Zap size={16} className="text-emerald-400" />
              REAL PERFORMANCE METRICS MONITOR (SECTION 15)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase block">API LATENCY</span>
                <strong className="text-xl text-purple-300 block">{perfMetrics?.apiLatencyMs || 42} ms</strong>
                <span className="text-[10px] text-emerald-400">Within 50ms SLA</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase block">WEBSOCKET LATENCY</span>
                <strong className="text-xl text-cyan-300 block">{perfMetrics?.webSocketLatencyMs || 28} ms</strong>
                <span className="text-[10px] text-emerald-400">Live 0.8s Sync</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase block">EVENTS / SECOND</span>
                <strong className="text-xl text-emerald-400 block">{perfMetrics?.eventsPerSec || 128} /s</strong>
                <span className="text-[10px] text-emerald-400">Host Telemetry Active</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase block">DATABASE LATENCY</span>
                <strong className="text-xl text-slate-100 block">{perfMetrics?.databaseLatencyMs || 8} ms</strong>
                <span className="text-[10px] text-emerald-400">JDBC PostgreSQL 15</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase block">FRONTEND LOAD TIME</span>
                <strong className="text-xl text-amber-300 block">{perfMetrics?.frontendLoadTimeSec || 1.8} s</strong>
                <span className="text-[10px] text-emerald-400">Optimized Bundle</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DeploymentView;
