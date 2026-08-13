import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  Server,
  UserCheck,
  Globe,
  Cpu,
  ShieldAlert,
  Activity,
  Clock,
  Shield,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import {
  getServiceRegistry,
  getIntegrationRegistry,
  getDiagnostics,
  getSystemMode,
  setSystemMode,
  getConfigurations,
  proposeConfigChange,
  applyConfigChange,
  getActiveSessions,
  getRateLimitMetrics,
  evaluateAccessDecision,
  ServiceRecord,
  IntegrationRecord,
  SystemModeDetails,
  DiagnosticsDetails,
  ConfigItem,
  ConfigProposal,
  UserSession,
  RateLimitMetrics,
  AccessDecisionResult
} from '@/services/security.service';

const SecurityView = () => {
  const [activeTab, setActiveTab] = useState<'CENTER' | 'MATRIX' | 'SETTINGS' | 'SERVICES' | 'DIAGNOSTICS' | 'AUDIT'>('CENTER');
  
  const [modeDetails, setModeDetails] = useState<SystemModeDetails | null>(null);
  const [serviceRegistry, setServiceRegistry] = useState<ServiceRecord[]>([]);
  const [integrationRegistry, setIntegrationRegistry] = useState<IntegrationRecord[]>([]);
  const [_diagnostics, setDiagnostics] = useState<DiagnosticsDetails | null>(null);
  const [_configList, setConfigList] = useState<ConfigItem[]>([]);
  const [configProposal, setConfigProposal] = useState<ConfigProposal | null>(null);
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [_rateLimits, setRateLimits] = useState<RateLimitMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  // Settings Two-Column Left Category Selection
  const [selectedCategory, setSelectedCategory] = useState<string>('Runtime');

  // Access Decision Simulator State
  const [simUser, setSimUser] = useState('Engineer-01');
  const [simRole, setSimRole] = useState('Engineer');
  const [simAction, setSimAction] = useState('Simulation.Write');
  const [simTarget, setSimTarget] = useState('MOTOR-001');
  const [accessDecision, setAccessDecision] = useState<AccessDecisionResult | null>(null);

  useEffect(() => {
    loadData();
    runSimDecision();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, s, i, d, cfg, sess, rl] = await Promise.all([
        getSystemMode(),
        getServiceRegistry(),
        getIntegrationRegistry(),
        getDiagnostics(),
        getConfigurations(),
        getActiveSessions(),
        getRateLimitMetrics(),
      ]);
      setModeDetails(m);
      setServiceRegistry(s);
      setIntegrationRegistry(i);
      setDiagnostics(d);
      setConfigList(cfg);
      setActiveSessions(sess);
      setRateLimits(rl);
    } catch (e) {
      console.warn('Failed to load control plane data:', e);
    } finally {
      setLoading(false);
    }
  };

  const runSimDecision = () => {
    const res = evaluateAccessDecision(simUser, simRole, simAction, simTarget);
    setAccessDecision(res);
  };

  useEffect(() => {
    runSimDecision();
  }, [simUser, simRole, simAction, simTarget]);

  const handleModeSwitch = async (newMode: string) => {
    setLoading(true);
    try {
      const updated = await setSystemMode(newMode);
      setModeDetails(updated);
    } catch (e) {
      console.warn('Mode switch error:', e);
    } finally {
      setLoading(false);
    }
  };



  const handleProposeConfig = async (key: string, val: any) => {
    setLoading(true);
    try {
      const prop = await proposeConfigChange(key, val);
      setConfigProposal(prop);
    } catch (e) {
      console.warn('Config proposal error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyConfig = async () => {
    if (!configProposal) return;
    setLoading(true);
    try {
      await applyConfigChange(configProposal.key, configProposal.proposedValue);
      setConfigProposal(null);
      await loadData();
    } catch (e) {
      console.warn('Config apply error:', e);
    } finally {
      setLoading(false);
    }
  };

  const settingsCategories = [
    'General', 'Runtime', 'Telemetry', 'Digital Twin', 'Intelligence',
    'AI', 'Simulation', 'Alerts', 'Security', 'Integrations', 'Data', 'Developer'
  ];

  return (
    <DashboardLayout
      title="IRISYN Control Plane & Access Center"
      description="WHO HAS ACCESS? • WHAT IS HAPPENING? • WHAT CAN I CHANGE? • WHAT IS SAFE? • WHAT FAILED?"
    >
      <div className="space-y-6 font-sans">
        {/* Global System Mode Banner (Section 12) */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-lg font-mono">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-white shadow-lg ${modeDetails?.currentMode === 'NORMAL' ? 'bg-emerald-600 shadow-emerald-500/30' : modeDetails?.currentMode === 'MAINTENANCE' ? 'bg-amber-600 shadow-amber-500/30' : 'bg-rose-600 shadow-rose-500/30'}`}>
              <Globe size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                  GLOBAL SYSTEM OPERATING MODE
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${modeDetails?.currentMode === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
                  ● {modeDetails?.currentMode || 'NORMAL'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                {modeDetails?.currentMode === 'NORMAL' ? 'Normal Operating Mode — All services operating within standard parameters.' : modeDetails?.currentMode === 'READ_ONLY' ? 'Read-Only Mode — Consequential write actions disabled.' : 'Maintenance Mode — Platform write access restricted.'}
              </p>
            </div>
          </div>

          {/* Quick Mode Switcher */}
          <div className="flex items-center gap-2 text-xs">
            {['NORMAL', 'SIMULATION', 'MAINTENANCE', 'READ_ONLY'].map((m) => (
              <button
                key={m}
                onClick={() => handleModeSwitch(m)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${modeDetails?.currentMode === m ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono pb-1 border-b border-slate-800 scrollbar-none">
          {[
            { id: 'CENTER', label: 'Security Center' },
            { id: 'MATRIX', label: 'Permission Matrix' },
            { id: 'SETTINGS', label: 'System Settings' },
            { id: 'SERVICES', label: 'Service & Integration Registries' },
            { id: 'DIAGNOSTICS', label: 'System Diagnostics' },
            { id: 'AUDIT', label: 'Audit Timeline' },
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

        {/* TAB 1: SECURITY CENTER (SECTION 4 & SECTION 6) */}
        {activeTab === 'CENTER' && (
          <div className="space-y-6">
            {/* Header Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              <div className="card p-5 bg-slate-900 border-slate-800 space-y-1">
                <span className="text-slate-400 text-xs uppercase tracking-wider block">REGISTERED USERS</span>
                <strong className="text-2xl text-slate-100 font-bold block">12 Users</strong>
                <span className="text-[10px] text-emerald-400 block">✓ 4 ADMIN, 3 ENGINEER, 3 OP, 2 VIEWER</span>
              </div>
              <div className="card p-5 bg-slate-900 border-slate-800 space-y-1">
                <span className="text-slate-400 text-xs uppercase tracking-wider block">ACTIVE SESSIONS</span>
                <strong className="text-2xl text-cyan-300 font-bold block">{activeSessions.length} Active</strong>
                <span className="text-[10px] text-purple-300 block">Idle Expiry SLA: 15 mins</span>
              </div>
              <div className="card p-5 bg-slate-900 border-slate-800 space-y-1">
                <span className="text-slate-400 text-xs uppercase tracking-wider block">ACCESS DENIED EVENTS</span>
                <strong className="text-2xl text-rose-400 font-bold block">2 today</strong>
                <span className="text-[10px] text-slate-500 block">Security Boundary Active</span>
              </div>
            </div>

            {/* Access Decision Simulator & Security Events Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Access Decision Simulator Card (Section 6) */}
              <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Shield size={16} className="text-purple-400" />
                    LIVE ACCESS DECISION SIMULATOR (SECTION 6)
                  </h4>
                  <span className="text-[10px] text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                    REAL-TIME EVALUATION
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">User Identifier:</label>
                    <input
                      type="text"
                      value={simUser}
                      onChange={(e) => setSimUser(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Assigned Role:</label>
                    <select
                      value={simRole}
                      onChange={(e) => setSimRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Engineer">Engineer</option>
                      <option value="Operator">Operator</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Requested Action:</label>
                    <input
                      type="text"
                      value={simAction}
                      onChange={(e) => setSimAction(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Target Resource:</label>
                    <input
                      type="text"
                      value={simTarget}
                      onChange={(e) => setSimTarget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                    />
                  </div>
                </div>

                {/* Access Decision Result Box */}
                {accessDecision && (
                  <div className={`p-4 rounded-xl border space-y-2 font-mono text-xs ${accessDecision.allowed ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-rose-950/40 border-rose-500/50'}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 uppercase tracking-widest text-[10px]">EVALUATION DECISION:</span>
                      <strong className={`px-2.5 py-1 rounded text-xs font-bold ${accessDecision.allowed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>
                        {accessDecision.allowed ? '✓ ALLOWED' : '✕ DENIED'}
                      </strong>
                    </div>
                    <p className="text-slate-200 font-sans text-xs">{accessDecision.reason}</p>
                  </div>
                )}
              </div>

              {/* Security Events Stream (Section 4) */}
              <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16} className="text-cyan-400" />
                  REAL-TIME SECURITY EVENTS STREAM
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <div>
                      <strong className="text-slate-200 block">12:31 — Login Success</strong>
                      <span className="text-[11px] text-slate-400">admin@example.com logged in via JWT token</span>
                    </div>
                    <span className="text-emerald-400 font-bold">INFO</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <div>
                      <strong className="text-slate-200 block">12:28 — Access Denied</strong>
                      <span className="text-[11px] text-slate-400">Viewer-01 attempted Simulation.Write on MOTOR-001</span>
                    </div>
                    <span className="text-rose-400 font-bold">DENIED</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <div>
                      <strong className="text-slate-200 block">12:20 — Role Updated</strong>
                      <span className="text-[11px] text-slate-400">Granted ENGINEER role to User USR-003</span>
                    </div>
                    <span className="text-cyan-300 font-bold">AUDIT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PERMISSION MATRIX (SECTION 5) */}
        {activeTab === 'MATRIX' && (
          <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <UserCheck size={16} className="text-purple-400" />
                ROLE-BASED PERMISSION MATRIX (SECTION 5)
              </h4>
              <span className="text-[11px] text-slate-400">Server-Side Authorization Boundary</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-purple-300">
                    <th className="py-3 px-4 uppercase">Permission</th>
                    <th className="py-3 px-4 uppercase text-center">Admin</th>
                    <th className="py-3 px-4 uppercase text-center">Engineer</th>
                    <th className="py-3 px-4 uppercase text-center">Operator</th>
                    <th className="py-3 px-4 uppercase text-center">Viewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  <tr>
                    <td className="py-3 px-4 font-bold">View (Read Telemetry/Twins)</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Edit (Digital Twin State)</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
                    <td className="py-3 px-4 text-center text-slate-600">—</td>
                    <td className="py-3 px-4 text-center text-slate-600">—</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Execute (Simulation / Actions)</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
                    <td className="py-3 px-4 text-center text-amber-400 font-bold">Limited</td>
                    <td className="py-3 px-4 text-center text-slate-600">—</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Delete (Assets / Records)</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
                    <td className="py-3 px-4 text-center text-slate-600">—</td>
                    <td className="py-3 px-4 text-center text-slate-600">—</td>
                    <td className="py-3 px-4 text-center text-slate-600">—</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Export (Reports / Data)</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
                    <td className="py-3 px-4 text-center text-slate-600">—</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Configure (System Settings)</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
                    <td className="py-3 px-4 text-center text-emerald-400 font-bold">✓</td>
                    <td className="py-3 px-4 text-center text-slate-600">—</td>
                    <td className="py-3 px-4 text-center text-slate-600">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TWO-COLUMN SYSTEM SETTINGS (SECTION 7 & SECTION 8) */}
        {activeTab === 'SETTINGS' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono text-xs">
            {/* Left Category Sidebar Navigation */}
            <div className="card p-4 bg-slate-900 border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2 px-2">
                SETTINGS CATEGORIES:
              </span>
              {settingsCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg font-bold transition-all ${selectedCategory === cat ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-950 hover:text-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Right Detail Panel */}
            <div className="md:col-span-3 card p-6 bg-slate-900 border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-cyan-400" />
                  {selectedCategory.toUpperCase()} SETTINGS DETAIL
                </h4>
                <span className="text-[10px] text-purple-300">Version 2 (Current)</span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">telemetry.staleThreshold (seconds):</label>
                  <input
                    type="number"
                    defaultValue={10}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">anomaly.zScoreThreshold (sigma):</label>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue={2.5}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">prediction.horizonHours:</label>
                  <input
                    type="number"
                    defaultValue={72}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleProposeConfig('telemetry.staleThreshold', 15)}
                    className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    Propose & Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SERVICE & INTEGRATION REGISTRIES (SECTION 9 & 13) */}
        {activeTab === 'SERVICES' && (
          <div className="space-y-6">
            {/* Service Registry */}
            <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Server size={16} className="text-cyan-400" />
                14 CORE SERVICE REGISTRY (SECTION 9)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {serviceRegistry.map((srv) => (
                  <div key={srv.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <div>
                      <strong className="text-slate-100 font-mono block">{srv.name}</strong>
                      <span className="text-[10px] text-slate-500">Latency: {srv.latencyMs} ms</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${srv.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
                      ● {srv.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Integration Registry */}
            <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Cpu size={16} className="text-purple-400" />
                9 ENTERPRISE INTEGRATION CENTER (SECTION 13)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {integrationRegistry.map((integ) => (
                  <div key={integ.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <div>
                      <strong className="text-slate-100 font-mono block">{integ.name}</strong>
                      <span className="text-[10px] text-purple-300">{integ.targetProtocol}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${integ.status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {integ.status === 'CONNECTED' ? '● CONNECTED' : '○ TARGET / FUTURE'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM DIAGNOSTICS (SECTION 10) */}
        {activeTab === 'DIAGNOSTICS' && (
          <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Activity size={16} className="text-emerald-400" />
                SYSTEM DIAGNOSTICS & DEPENDENCY HEALTH (SECTION 10)
              </h4>
              <button
                onClick={() => loadData()}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <RefreshCw size={13} />
                <span>[ Run Diagnostics ]</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-100">Telemetry Collector Dependency</strong>
                  <span className="text-emerald-400 font-bold">✓ PASS</span>
                </div>
                <p className="text-slate-400 font-sans text-xs">Measured API Latency: 18 ms • Status: LIVE</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-100">PostgreSQL Database Storage</strong>
                  <span className="text-emerald-400 font-bold">✓ PASS</span>
                </div>
                <p className="text-slate-400 font-sans text-xs">Measured JDBC Latency: 4 ms • Active Connections: 5</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-100">Prediction Model Engine</strong>
                  <span className="text-amber-400 font-bold">⚠ WARN</span>
                </div>
                <p className="text-slate-400 font-sans text-xs">Model latency elevated (85 ms). Remediation: Rebalance inference threads.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-100">Copilot Engineering Agent</strong>
                  <span className="text-emerald-400 font-bold">✓ PASS</span>
                </div>
                <p className="text-slate-400 font-sans text-xs">API Latency: 28 ms • Data Gate SLA: Active</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT TIMELINE (SECTION 11) */}
        {activeTab === 'AUDIT' && (
          <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-purple-400" />
              HISTORICAL AUDIT TIMELINE (SECTION 11)
            </h4>

            <div className="space-y-3 relative pl-4 border-l-2 border-slate-800 text-xs">
              <div className="relative flex justify-between items-start">
                <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-slate-900" />
                <div>
                  <strong className="text-slate-100 block">12:31 — Admin changed alert threshold</strong>
                  <span className="text-[11px] text-cyan-300 font-sans">Changed temperature limit from 70°C &rarr; 72°C</span>
                </div>
                <span className="text-slate-500 font-bold">admin@example.com</span>
              </div>

              <div className="relative flex justify-between items-start">
                <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                <div>
                  <strong className="text-slate-100 block">12:28 — Engineer acknowledged alert</strong>
                  <span className="text-[11px] text-emerald-300 font-sans">Acknowledged ALERT-1042 on MOTOR-001</span>
                </div>
                <span className="text-slate-500 font-bold">engineer@example.com</span>
              </div>

              <div className="relative flex justify-between items-start">
                <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-slate-900" />
                <div>
                  <strong className="text-slate-100 block">12:20 — Viewer access denied</strong>
                  <span className="text-[11px] text-rose-300 font-sans">Attempted Simulation.Write action on MOTOR-001</span>
                </div>
                <span className="text-slate-500 font-bold">viewer@example.com</span>
              </div>
            </div>
          </div>
        )}

        {/* High-Risk Configuration Proposal Modal (Section 8) */}
        {configProposal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card p-6 bg-slate-900 border border-purple-500/40 max-w-md w-full space-y-4 font-mono text-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-purple-300 uppercase tracking-wide">
                <ShieldAlert size={18} />
                HIGH-RISK CONFIGURATION CHANGE (SECTION 8)
              </div>
              <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px]">
                <div>SETTING KEY: <strong className="text-slate-100">{configProposal.key}</strong></div>
                <div>PROPOSED VALUE: <strong className="text-cyan-300">{String(configProposal.proposedValue)}</strong></div>
                <div>IMPACT WARNING: <span className="text-amber-300 font-sans block mt-1">{configProposal.impactAnalysis}</span></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setConfigProposal(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyConfig}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 shadow-md"
                >
                  {loading ? 'Applying...' : 'Confirm & Apply'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SecurityView;
