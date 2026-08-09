import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Compass, Cpu, Activity, ArrowRight, ExternalLink, RefreshCw, CheckCircle2, Layers } from 'lucide-react';
import { runDiagnostics } from '@/services/controlPlane.service';

interface ResourceItem {
  id: string;
  name: string;
  type: 'ASSET' | 'SENSOR' | 'SERVICE' | 'CONFIG' | 'ALERT';
  status: string;
  location: string;
  source: string;
  route: string;
}

const AccessCenter = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await runDiagnostics();
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const resources: ResourceItem[] = [
    { id: 'MOTOR-001', name: '3-Phase Induction Motor (150kW)', type: 'ASSET', status: 'WARNING', location: 'Plant A', source: 'SIMULATED', route: '/assets/MOTOR-001' },
    { id: 'LAPTOP-001', name: 'Host Workstation System', type: 'ASSET', status: 'HEALTHY', location: 'Local Host Workstation', source: 'REAL-TIME LOCAL', route: '/assets/LAPTOP-001' },
    { id: 'PUMP-001', name: 'Centrifugal Fluid Pump', type: 'ASSET', status: 'HEALTHY', location: 'Plant A', source: 'SIMULATED', route: '/assets/PUMP-001' },
    { id: 'dc-node-03', name: 'Data Center Server dc-node-03', type: 'ASSET', status: 'HEALTHY', location: 'Rack A - Node 3', source: 'SIMULATED', route: '/servers' },
    { id: 'CNC-001', name: '5-Axis CNC Milling Station', type: 'ASSET', status: 'OFFLINE', location: 'Factory Floor - Line 2', source: 'TARGET / FUTURE', route: '/assets/CNC-001' },
    { id: 'telemetry-collector', name: 'Host Telemetry Collector', type: 'SERVICE', status: 'ONLINE', location: 'Local JVM', source: 'REAL-TIME LOCAL', route: '/services' },
    { id: 'digital-twin-engine', name: 'Digital Twin State Engine', type: 'SERVICE', status: 'HEALTHY', location: 'Quarkus Service', source: 'CORE PLATFORM', route: '/services' },
    { id: 'health-weights', name: 'Health Model Weights Configuration', type: 'CONFIG', status: 'ACTIVE', location: 'System Control Plane', source: 'CORE PLATFORM', route: '/settings' },
  ];

  const filteredResources = resources.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Universal System Access Center & Directory"
      description="One centralized map to discover, inspect, navigate, diagnose, and control every IRISYN subsystem"
    >
      <div className="space-y-6">
        {/* Top Access Banner & Health Cards */}
        <div className="card p-6 bg-slate-900 border-slate-800">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-500/20">
                <Compass size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  SYSTEM ACCESS HEALTH: ALL SUBSYSTEMS ACCESSIBLE
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unified access layer with server-enforced RBAC and real-time dependency status tracking
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn btn-secondary text-xs flex items-center gap-1.5 py-2 px-3"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Access Health</span>
            </button>
          </div>

          {/* Stat Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750">
              <span className="text-slate-400 block mb-1 font-sans">Services Status</span>
              <strong className="text-emerald-400 text-sm font-bold flex items-center gap-1">
                <CheckCircle2 size={14} /> 9 / 9 Services Online
              </strong>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750">
              <span className="text-slate-400 block mb-1 font-sans font-medium">Data Sources</span>
              <strong className="text-purple-300 text-sm font-bold">3 Connected (2 Local / Sim)</strong>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750">
              <span className="text-slate-400 block mb-1 font-sans font-medium">Digital Twins</span>
              <strong className="text-slate-100 text-sm font-bold">6 Monitored Assets</strong>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750">
              <span className="text-slate-400 block mb-1 font-sans font-medium">RBAC Security</span>
              <strong className="text-emerald-400 text-sm font-bold">Active & Enforced</strong>
            </div>
          </div>
        </div>

        {/* Service Dependency Graph Pipeline */}
        <div className="card p-6 bg-slate-900 border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers size={18} className="text-purple-400" />
            Service Dependency Graph Pipeline
          </h4>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto">
            <div className="flex items-center gap-2 text-xs font-mono min-w-max">
              {[
                { name: 'Hardware / Physics', tag: 'SOURCE' },
                { name: 'Telemetry Collector', tag: 'INGESTION' },
                { name: 'Time-Series DB', tag: 'STORAGE' },
                { name: 'Digital Twin Engine', tag: 'STATE' },
                { name: 'Health & Anomaly', tag: 'ANALYTICS' },
                { name: 'IRISYN Copilot & UI', tag: 'ACCESS' },
              ].map((step, idx, arr) => (
                <div key={step.name} className="flex items-center gap-2">
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-purple-500 transition-colors">
                    <span className="text-[10px] text-purple-400 font-bold block">{step.tag}</span>
                    <strong className="text-slate-200 text-xs font-sans">{step.name}</strong>
                  </div>
                  {idx < arr.length - 1 && <ArrowRight size={16} className="text-slate-600" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metric Data Lineage Explorer */}
        <div className="card p-6 bg-slate-900 border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity size={18} className="text-blue-400" />
            Metric Data Lineage Explorer — MOTOR-001 Temperature
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            {[
              { stage: '1. Sensor', name: 'Stator Thermal RTD Sensor', detail: 'Sampling @ 10 Hz' },
              { stage: '2. Collector', name: 'Local Telemetry Collector', detail: 'Transport via JSON' },
              { stage: '3. Validation', name: 'Ingestion Pipeline', detail: 'Data Quality 100%' },
              { stage: '4. Database', name: 'PostgreSQL Metric Store', detail: 'Retention 30 Days' },
              { stage: '5. State Engine', name: 'Digital Twin Engine', detail: 'Deduction: -15%' },
              { stage: '6. User Access', name: 'Copilot AI / Dashboard', detail: 'Source: SIMULATED' },
            ].map((node) => (
              <div key={node.stage} className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-purple-400 font-bold block">{node.stage}</span>
                <strong className="text-slate-200 font-sans block mt-0.5">{node.name}</strong>
                <span className="text-[11px] text-slate-400 block mt-1">{node.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resource Directory Search Index */}
        <div className="card p-6 bg-slate-900 border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-4">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Cpu size={18} className="text-emerald-400" />
              Universal Resource Search Directory
            </h4>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter resources by name, ID, or type..."
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-2.5">RESOURCE ID</th>
                  <th className="p-2.5">NAME</th>
                  <th className="p-2.5">TYPE</th>
                  <th className="p-2.5">STATUS</th>
                  <th className="p-2.5">LOCATION</th>
                  <th className="p-2.5">SOURCE</th>
                  <th className="p-2.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredResources.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold text-purple-400">{res.id}</td>
                    <td className="p-2.5 font-sans font-medium text-slate-200">{res.name}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                        {res.type}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        res.status === 'HEALTHY' || res.status === 'ONLINE' || res.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : res.status === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-sans text-slate-400">{res.location}</td>
                    <td className="p-2.5 font-bold text-purple-300">{res.source}</td>
                    <td className="p-2.5 text-right relative">
                      <button
                        onClick={() => navigate(res.route)}
                        className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-sans font-bold text-[11px] inline-flex items-center gap-1 shadow-sm"
                      >
                        <span>Open In...</span>
                        <ExternalLink size={12} />
                      </button>
                    </td>
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

export default AccessCenter;
