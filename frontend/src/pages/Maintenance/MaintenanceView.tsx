import React from 'react';
import { useMaintenanceOrders } from '@/hooks/usePlatformData';
import DataStateContainer from '@/components/ui/DataStateContainer';
import { Wrench, Calendar, User } from 'lucide-react';

export const MaintenanceView: React.FC = () => {
  const { data: workOrders, isLoading, isError, refetch } = useMaintenanceOrders();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-cyan-400" />
            <span>Maintenance & Work Orders</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Predictive, preventive, and corrective asset maintenance schedules.
          </p>
        </div>
      </div>

      <DataStateContainer
        status="success"
        isLoading={isLoading}
        isError={isError}
        isEmpty={!workOrders || workOrders.length === 0}
        onRetry={refetch}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workOrders?.map((order) => (
            <div
              key={order.id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
                    {order.type} MAINTENANCE
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mt-2">{order.assetName}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Order ID: {order.id} • Asset ID: {order.assetId}
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                  {order.priority} PRIORITY
                </span>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {order.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Assignee: <strong className="text-slate-200">{order.assignedEngineer || 'Unassigned'}</strong></span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Due: {new Date(order.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DataStateContainer>
    </div>
  );
};

export default MaintenanceView;
