import React from 'react';
import { useDiagnostics } from '@/hooks/usePlatformData';
import DataStateContainer from '@/components/ui/DataStateContainer';
import { Stethoscope, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const DiagnosticsView: React.FC = () => {
  const { data: checks, isLoading, isError, refetch } = useDiagnostics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-cyan-400" />
            <span>Platform Self-Diagnostics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated platform self-tests, sub-service readiness, and latency checks.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="px-3.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RUN DIAGNOSTICS</span>
        </button>
      </div>

      <DataStateContainer
        status="success"
        isLoading={isLoading}
        isError={isError}
        isEmpty={!checks || checks.length === 0}
        onRetry={refetch}
      >
        <div className="space-y-3">
          {checks?.map((check) => (
            <div
              key={check.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                {check.status === 'PASS' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-200">{check.component}</h3>
                  <p className="text-xs text-slate-400">{check.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="font-mono text-slate-400">{check.latencyMs}ms</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    check.status === 'PASS'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {check.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </DataStateContainer>
    </div>
  );
};

export default DiagnosticsView;
