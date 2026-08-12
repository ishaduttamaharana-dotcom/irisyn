import React from 'react';
import DataStateContainer from '@/components/ui/DataStateContainer';
import { ListOrdered } from 'lucide-react';

export const LogsView: React.FC = () => {
  const logs = [
    { id: 'LOG-101', time: new Date().toLocaleTimeString(), level: 'INFO', subsystem: 'LocalTelemetryCollector', message: 'Sampled host hardware telemetry (CPU: 18.2%, RAM: 44.5%, Temp: 48.0°C)' },
    { id: 'LOG-102', time: new Date(Date.now() - 3000).toLocaleTimeString(), level: 'INFO', subsystem: 'IndustrialSimulator', message: 'MOTOR-001 physics frame evaluated (1480 RPM, 88.5 Nm, 48.2°C)' },
    { id: 'LOG-103', time: new Date(Date.now() - 6000).toLocaleTimeString(), level: 'INFO', subsystem: 'DigitalTwinEngine', message: 'Re-evaluated composite health score for 3 registered assets' },
    { id: 'LOG-104', time: new Date(Date.now() - 12000).toLocaleTimeString(), level: 'WARN', subsystem: 'CopilotDataGate', message: 'Intercepted user query; enforcing mandatory tool data retrieval' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ListOrdered className="w-6 h-6 text-cyan-400" />
            <span>Platform System & Audit Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time subsystem execution events, telemetry capture trace, and security logs.
          </p>
        </div>
      </div>

      <DataStateContainer status="success">
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs space-y-2 overflow-x-auto">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 py-1 border-b border-slate-900 last:border-0">
              <span className="text-slate-500 shrink-0">{log.time}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  log.level === 'WARN' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                }`}
              >
                {log.level}
              </span>
              <span className="text-purple-400 font-semibold shrink-0">[{log.subsystem}]</span>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))}
        </div>
      </DataStateContainer>
    </div>
  );
};

export default LogsView;
