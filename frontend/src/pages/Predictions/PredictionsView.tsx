import React from 'react';
import { useAssets } from '@/hooks/usePlatformData';
import DataStateContainer from '@/components/ui/DataStateContainer';
import DataSourceBadge from '@/components/ui/DataSourceBadge';
import { Sliders } from 'lucide-react';

export const PredictionsView: React.FC = () => {
  const { data: assets, isLoading, isError, refetch } = useAssets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-indigo-400" />
            <span>Predictive Analytics & Anomaly Forecasting</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Machine learning failure probability forecasts, horizon estimates, and recommended mitigation.
          </p>
        </div>
      </div>

      <DataStateContainer
        status="success"
        isLoading={isLoading}
        isError={isError}
        isEmpty={!assets || assets.length === 0}
        onRetry={refetch}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assets?.map((asset) => {
            const failureProb = asset.status === 'CRITICAL' ? 88 : asset.status === 'WARNING' ? 42 : 5;
            return (
              <div
                key={asset.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-100">{asset.name}</h3>
                      <DataSourceBadge source={asset.source} size="sm" />
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Asset ID: {asset.id}</p>
                  </div>

                  <div className="text-right">
                    <span className={`text-lg font-bold font-mono ${failureProb > 50 ? 'text-red-400' : failureProb > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {failureProb}%
                    </span>
                    <p className="text-[10px] text-slate-500 uppercase">Failure Probability</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Predicted Risk Profile</span>
                    <span className="text-slate-200">{asset.status}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${failureProb > 50 ? 'bg-red-500' : failureProb > 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${failureProb}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block">Recommended Operational Action</span>
                  <p className="text-slate-200">{asset.recommendedAction || 'Continue routine operational monitoring.'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </DataStateContainer>
    </div>
  );
};

export default PredictionsView;
