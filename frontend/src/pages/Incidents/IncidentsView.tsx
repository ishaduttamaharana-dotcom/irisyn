import React from 'react';
import { useIncidents } from '@/hooks/usePlatformData';
import DataStateContainer from '@/components/ui/DataStateContainer';
import { AlertTriangle, Clock, ShieldAlert, UserCheck } from 'lucide-react';

export const IncidentsView: React.FC = () => {
  const { data: incidents, isLoading, isError, refetch } = useIncidents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <span>Incidents & Operational Events</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Active and historical platform incidents requiring investigation or mitigation.
          </p>
        </div>
      </div>

      <DataStateContainer
        status="success"
        isLoading={isLoading}
        isError={isError}
        isEmpty={!incidents || incidents.length === 0}
        onRetry={refetch}
      >
        <div className="space-y-4">
          {incidents?.map((incident) => (
            <div
              key={incident.id}
              className="p-5 rounded-xl bg-slate-900/80 border border-amber-900/30 hover:border-amber-700/50 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{incident.title}</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      ID: {incident.id} • Asset: {incident.assetId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                    {incident.severity}
                  </span>
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
                    {incident.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                {incident.summary}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Assigned: <strong className="text-slate-200">{incident.assignedTo || 'Unassigned'}</strong></span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Created: {new Date(incident.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DataStateContainer>
    </div>
  );
};

export default IncidentsView;
