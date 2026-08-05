import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock, XCircle, Terminal, RefreshCw, X } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface AutomationLog {
  id: string;
  jobName: string;
  status: string;
  executedAt: string;
  details: string;
}

const ICON_MAP = {
  SUCCESS: <CheckCircle2 className="text-emerald-500" size={16} />,
  COMPLETED: <CheckCircle2 className="text-emerald-500" size={16} />,
  RUNNING: <Clock className="text-amber-500" size={16} />,
  IN_PROGRESS: <Clock className="text-amber-500" size={16} />,
  FAILED: <XCircle className="text-rose-500" size={16} />,
};

const AutomationStatus = () => {
  const [selectedLog, setSelectedLog] = useState<AutomationLog | null>(null);

  // Fetch live logs
  const { data: logs = [], isLoading, refetch } = useQuery<AutomationLog[]>({
    queryKey: ['automation-logs'],
    queryFn: () => apiClient.get('/automation-logs').then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="card p-4 animate-pulse space-y-3">
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Active Jobs List */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ansible AAP Automation History</p>
          <button onClick={() => refetch()} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <RefreshCw size={12} className="animate-hover-spin" />
          </button>
        </div>
        
        <ul className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {logs.map((log) => (
            <li
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="flex items-center justify-between text-xs p-2 rounded-lg border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
            >
              <div className="truncate pr-2">
                <span className="font-semibold text-slate-700 dark:text-slate-200 block truncate">{log.jobName}</span>
                <span className="text-[10px] text-slate-400 block">{new Date(log.executedAt).toLocaleTimeString()}</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                {ICON_MAP[log.status as keyof typeof ICON_MAP] || <CheckCircle2 className="text-slate-500" size={16} />}
                {log.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Terminal Playbook Console Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[500px]">
            
            {/* Console Header */}
            <div className="flex items-center justify-between border-b border-slate-900 bg-slate-900/40 px-4 py-3 shrink-0">
              <div className="flex items-center gap-2">
                <Terminal className="text-brand-500" size={16} />
                <span className="text-xs font-bold text-slate-300 font-mono">{selectedLog.jobName}</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] text-emerald-400 space-y-1 bg-slate-950 select-text scrollbar-thin">
              {selectedLog.details.split('\n').map((line, idx) => {
                let color = 'text-slate-300';
                if (line.includes('PLAY') || line.includes('TASK')) {
                  color = 'text-brand-400 font-bold';
                } else if (line.includes('ok:')) {
                  color = 'text-emerald-400';
                } else if (line.includes('changed:')) {
                  color = 'text-amber-400';
                } else if (line.includes('failed:')) {
                  color = 'text-rose-500 font-bold';
                } else if (line.includes('[AAP Console]')) {
                  color = 'text-brand-500 font-semibold';
                }
                return (
                  <div key={idx} className={color}>
                    {line}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AutomationStatus;
