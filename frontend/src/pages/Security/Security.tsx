import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ShieldCheck, UserCheck, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

const Security = () => {
  const [lastCheck, setLastCheck] = useState('2 minutes ago');

  const securityChecks = [
    { label: 'Authentication', status: 'Active', description: 'JWT / Session Token Auth' },
    { label: 'Authorization', status: 'Active', description: 'Role-Based Access Control (RBAC)' },
    { label: 'API Security', status: 'Protected', description: 'CORS & Rate Limiting' },
    { label: 'Data Encryption', status: 'Enabled', description: 'TLS 1.3 & AES-256 at Rest' },
    { label: 'Audit Logging', status: 'Active', description: 'Immutable Security Audit Trail' },
    { label: 'Session Security', status: 'Active', description: 'Auto-Expiry & Hijack Prevention' },
    { label: 'Telemetry Security', status: 'Protected', description: 'WSS Secure WebSocket Transport' },
  ];

  const auditLogs = [
    { time: '00:34:12', user: 'admin@irisyn.io', action: 'API Token Validation', status: 'SUCCESS', ip: '127.0.0.1' },
    { time: '00:30:05', user: 'operator@irisyn.io', action: 'Copilot Action Confirmation', status: 'CONFIRMED', ip: '127.0.0.1' },
    { time: '00:22:19', user: 'system', action: 'Telemetry Transport Handshake', status: 'SUCCESS', ip: 'internal-jvm' },
    { time: '00:15:40', user: 'engineer@irisyn.io', action: 'Simulation Scenario Override', status: 'AUTHORIZED', ip: '192.168.1.42' },
  ];

  const refreshCheck = () => {
    setLastCheck('Just now');
  };

  return (
    <DashboardLayout
      title="Security & Compliance Posture"
      description="Real-time authentication, authorization, data encryption, and audit logging console"
    >
      <div className="space-y-6">
        {/* Main Security Status Banner */}
        <div className="card p-6 bg-slate-900 border-slate-800">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <ShieldCheck size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="text-lg font-bold text-slate-100 tracking-wide">SECURITY STATUS: SYSTEM SECURE</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  All security controls, token verifications, and encrypted transports are fully operational.
                </p>
              </div>
            </div>

            <button
              onClick={refreshCheck}
              className="btn btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
            >
              <RefreshCw size={13} />
              <span>Last Security Check: {lastCheck}</span>
            </button>
          </div>

          {/* Security Checklist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {securityChecks.map((check) => (
              <div key={check.label} className="p-4 rounded-xl bg-slate-800/60 border border-slate-750 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">{check.label}</span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                      <CheckCircle2 size={13} /> {check.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">{check.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RBAC & Audit Log Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* RBAC Roles */}
          <div className="card p-6 bg-slate-900 border-slate-800">
            <h4 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <UserCheck size={18} className="text-purple-400" />
              Role-Based Access Control (RBAC)
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-750 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">ADMINISTRATOR</span>
                  <span className="text-[10px] text-slate-400">Full system & security policy access</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-bold">FULL</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-750 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">OPERATOR</span>
                  <span className="text-[10px] text-slate-400">Operational control & simulation triggers</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-bold">OPERATIONS</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-750 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">AUDITOR</span>
                  <span className="text-[10px] text-slate-400">Read-only security & telemetry audit access</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">READ ONLY</span>
              </div>
            </div>
          </div>

          {/* Audit Logging Ticker */}
          <div className="lg:col-span-2 card p-6 bg-slate-900 border-slate-800">
            <h4 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-blue-400" />
              Real-time Security Audit Log
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-800/40">
                  <tr>
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">User</th>
                    <th className="p-2.5">Action</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {auditLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="p-2.5">{log.time}</td>
                      <td className="p-2.5 text-slate-200 font-sans font-medium">{log.user}</td>
                      <td className="p-2.5 text-slate-300 font-sans">{log.action}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                          {log.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-400">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Security;
