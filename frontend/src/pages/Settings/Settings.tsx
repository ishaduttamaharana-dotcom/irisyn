import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  Sliders, Shield, Activity, Cpu, Bell, Database, Terminal, Settings as SettingsIcon,
  RefreshCw, Layers, Check, X, UserCheck
} from 'lucide-react';
import {
  getControlPlaneOverview, updateConfigParam, updateHealthWeights, runDiagnostics, getRbacMatrix,
  evaluateAccessDecision, SystemDiagnostics, RbacMatrixRow, AccessDecision
} from '@/services/controlPlane.service';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'assets' | 'telemetry' | 'health' | 'alerts' | 'security' | 'integrations' | 'diagnostics'>('system');
  
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics | null>(null);
  const [rbacMatrix, setRbacMatrix] = useState<RbacMatrixRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [platformName, setPlatformName] = useState('IRISYN');
  const [tagline, setTagline] = useState('SEE • PREDICT • ACT');
  const [intervalSec, setIntervalSec] = useState('1');
  const [weights, setWeights] = useState<Record<string, number>>({ cpu: 20, thermal: 20, ram: 15, disk: 15, anomaly: 20, availability: 10 });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // RBAC Access Simulator
  const [simRole, setSimRole] = useState<'ADMIN' | 'ENGINEER' | 'OPERATOR' | 'VIEWER'>('OPERATOR');
  const [simPerm, setSimPerm] = useState('Simulation.Write');
  const [accessDecision, setAccessDecision] = useState<AccessDecision | null>(null);

  useEffect(() => {
    loadControlPlaneData();
  }, []);

  const loadControlPlaneData = async () => {
    try {
      const data = await getControlPlaneOverview();
      setPlatformName(data.platformName);
      setTagline(data.tagline);
      setIntervalSec(String(data.collectionIntervalSec));
      if (data.healthWeights) setWeights(data.healthWeights);

      const rbac = await getRbacMatrix();
      setRbacMatrix(rbac);
    } catch (e) {
      // fallback
    }
  };

  const handleSaveSystemConfig = async () => {
    setLoading(true);
    try {
      await updateConfigParam('system.platformName', platformName);
      await updateConfigParam('system.tagline', tagline);
      await updateConfigParam('telemetry.collectionIntervalSec', intervalSec);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHealthWeights = async () => {
    setLoading(true);
    try {
      await updateHealthWeights(weights);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleRunDiagnostics = async () => {
    setLoading(true);
    try {
      const diag = await runDiagnostics();
      setDiagnostics(diag);
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleTestRbacAccess = async () => {
    try {
      const res = await evaluateAccessDecision(simPerm, 'SystemControl', 'test_user', simRole);
      setAccessDecision(res);
    } catch (e) {
      // fallback
    }
  };

  return (
    <DashboardLayout
      title="IRISYN Control Center & Master Settings"
      description="Centralized system control plane driving telemetry, digital twin health weights, alerts, and security RBAC"
    >
      <div className="space-y-6">
        {/* Top Control Plane Banner */}
        <div className="card p-6 bg-slate-900 border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-500/20">
              <SettingsIcon size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">{platformName} CONTROL PLANE</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  CENTRALIZED CONTROL ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{tagline} • Mode: <strong className="text-purple-300">HYBRID DEMO</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5">
              <Activity size={14} className="animate-pulse" /> Telemetry Interval: {intervalSec}s
            </span>
            {saveSuccess && (
              <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold animate-in fade-in">
                ✓ Saved to Control Plane!
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'system', label: '1. General System', icon: Sliders },
            { id: 'assets', label: '2. Asset Hierarchy', icon: Layers },
            { id: 'telemetry', label: '3. Telemetry & Transport', icon: Activity },
            { id: 'health', label: '4. Digital Twin Health Weights', icon: Cpu },
            { id: 'alerts', label: '5. Alert Rules & Operations', icon: Bell },
            { id: 'security', label: '6. Security & RBAC Matrix', icon: Shield },
            { id: 'integrations', label: '7. Integrations Center', icon: Database },
            { id: 'diagnostics', label: '8. Diagnostics & Flags', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                  active
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: General System */}
        {activeTab === 'system' && (
          <div className="card p-6 bg-slate-900 border-slate-800 space-y-6">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders size={18} className="text-purple-400" />
              General System Configuration
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Platform Name</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Telemetry Collection Interval</label>
                <select
                  value={intervalSec}
                  onChange={(e) => setIntervalSec(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                >
                  <option value="1">1 second (High Frequency)</option>
                  <option value="5">5 seconds (Standard)</option>
                  <option value="10">10 seconds (Low Overhead)</option>
                  <option value="30">30 seconds (Conservation Mode)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Operating Environment</label>
                <input
                  type="text"
                  disabled
                  value="DEVELOPMENT / DEMO (Hybrid Workstation + Motor)"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-400 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={handleSaveSystemConfig}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Asset Hierarchy */}
        {activeTab === 'assets' && (
          <div className="card p-6 bg-slate-900 border-slate-800 space-y-6">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Layers size={18} className="text-blue-400" />
              Asset Hierarchy & Multi-Site Schema
            </h4>

            <p className="text-xs text-slate-400 leading-relaxed">
              IRISYN supports multi-site hierarchy: <strong className="text-purple-300 font-mono">Organization → Site → Plant → Area → Asset → Sensor → Metric</strong>.
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
              <div className="text-purple-400 font-bold">IRISYN Enterprise Organization</div>
              <div className="pl-4 border-l border-slate-800 space-y-2">
                <div>└── Plant A (Industrial Simulation Site)</div>
                <div className="pl-6 border-l border-slate-800 text-slate-400 space-y-1">
                  <div>├── MOTOR-001 (Siemens 150kW Induction Motor) — <span className="text-amber-400 font-bold">SIMULATED</span></div>
                  <div>└── PUMP-001 (Centrifugal Fluid Pump) — <span className="text-purple-400 font-bold">SIMULATED</span></div>
                </div>
                <div>└── Host Workstation Site</div>
                <div className="pl-6 border-l border-slate-800 text-slate-400 space-y-1">
                  <div>└── LAPTOP-001 (Local Host Hardware) — <span className="text-emerald-400 font-bold">REAL-TIME LOCAL</span></div>
                </div>
                <div>└── Data Center Rack A</div>
                <div className="pl-6 border-l border-slate-800 text-slate-400 space-y-1">
                  <div>└── dc-node-01..06 (Hypervisor Servers) — <span className="text-blue-400 font-bold">SIMULATED</span></div>
                </div>
                <div>└── Blueprint Target Sites</div>
                <div className="pl-6 border-l border-slate-800 text-slate-500">
                  <div>└── CNC-001 (5-Axis Milling Station) — <span className="text-slate-500 font-bold">TARGET / FUTURE</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Digital Twin Health Weights */}
        {activeTab === 'health' && (
          <div className="card p-6 bg-slate-900 border-slate-800 space-y-6">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Cpu size={18} className="text-purple-400" />
              Dynamic Digital Twin Health Model Weights
            </h4>

            <p className="text-xs text-slate-400">
              Configure penalty factors for composite 0–100% health calculation. Changes immediately update the <strong className="text-purple-300 font-mono">DigitalTwinEngine</strong> backend.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
              {Object.entries(weights).map(([key, val]) => (
                <div key={key} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="uppercase text-purple-300 font-mono">{key} Weight</span>
                    <span className="text-slate-100 font-mono">{val}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={val}
                    onChange={(e) => setWeights({ ...weights, [key]: parseInt(e.target.value) })}
                    className="w-full accent-purple-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={handleSaveHealthWeights}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                {loading ? 'Saving Weights...' : 'Apply Dynamic Health Model'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 6: Security & RBAC Matrix */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* RBAC Matrix Table */}
            <div className="card p-6 bg-slate-900 border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Shield size={18} className="text-emerald-400" />
                Server-Enforced Role-Based Access Control (RBAC) Matrix
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-800 text-slate-300">
                    <tr>
                      <th className="p-2.5">PERMISSION</th>
                      <th className="p-2.5 text-center">ADMIN</th>
                      <th className="p-2.5 text-center">ENGINEER</th>
                      <th className="p-2.5 text-center">OPERATOR</th>
                      <th className="p-2.5 text-center">VIEWER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {rbacMatrix.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-sans font-medium text-slate-200">{row.permission}</td>
                        <td className="p-2.5 text-center">{row.ADMIN ? <Check size={16} className="mx-auto text-emerald-400" /> : <X size={16} className="mx-auto text-rose-500" />}</td>
                        <td className="p-2.5 text-center">{row.ENGINEER ? <Check size={16} className="mx-auto text-emerald-400" /> : <X size={16} className="mx-auto text-rose-500" />}</td>
                        <td className="p-2.5 text-center">{row.OPERATOR ? <Check size={16} className="mx-auto text-emerald-400" /> : <X size={16} className="mx-auto text-rose-500" />}</td>
                        <td className="p-2.5 text-center">{row.VIEWER ? <Check size={16} className="mx-auto text-emerald-400" /> : <X size={16} className="mx-auto text-rose-500" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Access Decision Simulator */}
            <div className="card p-6 bg-slate-900 border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                <UserCheck size={18} className="text-purple-400" />
                Server-Side Access Decision Evaluator Simulator
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Target Role</label>
                  <select
                    value={simRole}
                    onChange={(e) => setSimRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono"
                  >
                    <option value="ADMIN">ADMIN (Full Access)</option>
                    <option value="ENGINEER">ENGINEER (Engineering & Simulation)</option>
                    <option value="OPERATOR">OPERATOR (Operations & Alerts)</option>
                    <option value="VIEWER">VIEWER (Read Only)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Target Permission</label>
                  <select
                    value={simPerm}
                    onChange={(e) => setSimPerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono"
                  >
                    <option value="Simulation.Write">Simulation.Write (Inject Fault)</option>
                    <option value="Thresholds.Write">Thresholds.Write (Change Thresholds)</option>
                    <option value="Alerts.Acknowledge">Alerts.Acknowledge (Acknowledge Alert)</option>
                    <option value="Users.Manage">Users.Manage (Security Control)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleTestRbacAccess}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                  >
                    Evaluate Decision
                  </button>
                </div>
              </div>

              {accessDecision && (
                <div className={`p-4 rounded-xl font-mono text-xs space-y-1 ${
                  accessDecision.decision === 'ALLOWED'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}>
                  <div className="font-bold text-sm">ACCESS DECISION: {accessDecision.decision}</div>
                  <div>User: {accessDecision.user} | Role: {accessDecision.role}</div>
                  <div>Permission: {accessDecision.permission}</div>
                  <div className="text-slate-300">Reason: {accessDecision.reason}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 7: Integrations */}
        {activeTab === 'integrations' && (
          <div className="card p-6 bg-slate-900 border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Database size={18} className="text-blue-400" />
              Integration Center & Connection Posture
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              {[
                { name: 'Local Telemetry Collector', type: 'System Telemetry', status: 'CONNECTED', tag: 'REAL-TIME LOCAL' },
                { name: '3-Phase Motor Physics Engine', type: 'Simulator', status: 'RUNNING', tag: 'SIMULATED' },
                { name: 'PostgreSQL / H2 Data Store', type: 'Database', status: 'CONNECTED', tag: 'STORAGE' },
                { name: 'Industrial OPC-UA Gateway', type: 'PLC Transport', status: 'TARGET / FUTURE', tag: 'BLUEPRINT' },
                { name: 'MQTT Broker Edge Node', type: 'Telemetry Edge', status: 'TARGET / FUTURE', tag: 'BLUEPRINT' },
                { name: 'Red Hat OpenShift AI Platform', type: 'MLOps Cloud', status: 'TARGET / FUTURE', tag: 'BLUEPRINT' },
              ].map((item) => (
                <div key={item.name} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-100">{item.name}</h5>
                    <span className="text-[11px] text-slate-400">{item.type}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    item.status === 'CONNECTED' || item.status === 'RUNNING'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 8: Diagnostics */}
        {activeTab === 'diagnostics' && (
          <div className="card p-6 bg-slate-900 border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Terminal size={18} className="text-purple-400" />
                Live System Diagnostics & Latency Tester
              </h4>

              <button
                onClick={handleRunDiagnostics}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Run Diagnostics</span>
              </button>
            </div>

            {diagnostics ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold flex items-center justify-between">
                  <span>OVERALL SYSTEM DIAGNOSTICS: {diagnostics.overallStatus}</span>
                  <span>Execution Time: {diagnostics.totalDiagnosticsDurationMs} ms</span>
                </div>

                <div className="space-y-2">
                  {diagnostics.components.map((comp, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-200">{comp.name}</div>
                        <div className="text-[11px] text-slate-400 font-sans">{comp.details}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-purple-400">{comp.latencyMs} ms</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          comp.status === 'TARGET / FUTURE' ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {comp.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                Click <strong>"Run Diagnostics"</strong> to execute live latency and connectivity tests across platform components.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
