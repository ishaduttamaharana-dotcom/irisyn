import React from 'react';
import { useIntegrations } from '@/hooks/usePlatformData';
import DataStateContainer from '@/components/ui/DataStateContainer';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import { Link2 } from 'lucide-react';

export const IntegrationsView: React.FC = () => {
  const { data: integrations, isLoading, isError, refetch } = useIntegrations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Link2 className="w-6 h-6 text-purple-400" />
            <span>Integrations & Telemetry Connectors</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Active telemetry collectors, synthetic simulators, and target industrial protocol adapters.
          </p>
        </div>
      </div>

      <DataStateContainer
        status="success"
        isLoading={isLoading}
        isError={isError}
        isEmpty={!integrations || integrations.length === 0}
        onRetry={refetch}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations?.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">{item.name}</h3>
                    <DataSourceBadge source={item.sourceCategory} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Protocol: {item.protocol}</p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                    item.status === 'CONNECTED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-purple-500/10 text-purple-300 border border-purple-500/30 border-dashed'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <p className="text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                {item.description}
              </p>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                <span>Endpoint: {item.endpoint}</span>
                <span>{item.latencyMs && item.latencyMs > 0 ? `${item.latencyMs}ms` : 'STANDBY'}</span>
              </div>
            </div>
          ))}
        </div>
      </DataStateContainer>
    </div>
  );
};

export default IntegrationsView;
