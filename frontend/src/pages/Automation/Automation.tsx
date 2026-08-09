import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { AlertTriangle, Workflow, ShieldCheck, CheckCircle2 } from 'lucide-react';
import IncidentTimeline from '@/components/dashboard/IncidentTimeline';

const Automation = () => {
  const [alerts, setAlerts] = useState([
    { id: 'ALT-1042', severity: 'WARNING', source: 'MOTOR-001', message: 'Bearing vibration elevated (4.8 mm/s RMS)', time: '09:36:12', acknowledged: false },
    { id: 'ALT-1041', severity: 'CRITICAL', source: 'dc-node-03', message: 'CPU utilization sustained above 92%', time: '09:30:00', acknowledged: false },
    { id: 'ALT-1040', severity: 'INFO', source: 'LAPTOP-001', message: 'Local telemetry stream transport validated', time: '09:15:00', acknowledged: true },
  ]);

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  return (
    <DashboardLayout
      title="Alerts, Incidents & Automated Remediation"
      description="Real-time alert rules, incident timeline, and automated playbooks"
    >
      <div className="space-y-6">
        {/* Top Alert & Remediation Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4 bg-slate-900 border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Unacknowledged Alerts</span>
              <p className="text-2xl font-bold text-slate-100 mt-1">
                {alerts.filter((a) => !a.acknowledged).length}
              </p>
            </div>
            <AlertTriangle className="text-amber-400" size={32} />
          </div>

          <div className="card p-4 bg-slate-900 border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Automated Remediation Rules</span>
              <p className="text-2xl font-bold text-slate-100 mt-1">4 Active Rules</p>
            </div>
            <Workflow className="text-purple-400" size={32} />
          </div>

          <div className="card p-4 bg-slate-900 border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Audit Safety Engine</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">ACTIVE</p>
            </div>
            <ShieldCheck className="text-emerald-400" size={32} />
          </div>
        </div>

        {/* Main Grid: Active Alerts Table + Incident Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Alerts Directory Table */}
            <div className="card p-6 bg-slate-900 border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                <AlertTriangle size={18} className="text-amber-400" />
                Active Threshold & Anomaly Alerts
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-800/60 text-slate-300">
                    <tr>
                      <th className="p-2.5">ALERT ID</th>
                      <th className="p-2.5">SEVERITY</th>
                      <th className="p-2.5">SOURCE</th>
                      <th className="p-2.5">MESSAGE</th>
                      <th className="p-2.5">TIME</th>
                      <th className="p-2.5 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {alerts.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-bold text-purple-400">{a.id}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : a.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {a.severity}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold text-slate-200">{a.source}</td>
                        <td className="p-2.5 font-sans">{a.message}</td>
                        <td className="p-2.5 text-slate-400">{a.time}</td>
                        <td className="p-2.5 text-right">
                          {a.acknowledged ? (
                            <span className="text-emerald-400 text-[11px] font-bold flex items-center justify-end gap-1 font-sans">
                              <CheckCircle2 size={13} /> Acknowledged
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAcknowledge(a.id)}
                              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-sans text-[10px] font-bold shadow-sm"
                            >
                              Acknowledge
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Automated Remediation Logic */}
            <div className="card p-6 bg-slate-900 border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Workflow size={18} className="text-purple-400" />
                Automated Remediation Rules (IF / AND / THEN)
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-purple-400 font-bold">Rule #1: Stator Overheat Protection</div>
                  <div className="text-slate-300">IF: Temperature &gt; 80°C AND Vibration Increasing THEN: Trigger Warning, Deduct Health, Recommend Lubrication</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-purple-400 font-bold">Rule #2: Hypervisor Memory Recitation</div>
                  <div className="text-slate-300">IF: RAM Load &gt; 90% FOR 5 mins THEN: Create Alert, Suggest `restart-vm.yml` Playbook</div>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Incident Timeline Panel */}
          <div>
            <IncidentTimeline />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Automation;
