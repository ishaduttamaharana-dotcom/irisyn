import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAlerts } from '@/services/alerts.service';
import { apiClient } from '@/services/apiClient';
import { AlertCircle, AlertTriangle, Info, Check, RefreshCw } from 'lucide-react';

interface Alert {
  id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  source: string;
  createdAt: string;
  acknowledged: boolean;
}

const IncidentTimeline = () => {
  const queryClient = useQueryClient();

  // Fetch active alerts
  const { data: alerts = [], isLoading, refetch } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: getAlerts,
  });

  // Acknowledge alert mutation
  const ackMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/alerts/${id}/acknowledge`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      queryClient.invalidateQueries({ queryKey: ['cluster'] });
    },
  });

  if (isLoading) {
    return (
      <div className="card p-4 animate-pulse space-y-3">
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Incident Timeline</h4>
        <button onClick={() => refetch()} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
          <RefreshCw size={12} />
        </button>
      </div>

      {activeAlerts.length > 0 ? (
        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 pl-5 space-y-4">
          {activeAlerts.map((alert) => {
            const icon =
              alert.severity === 'CRITICAL' ? (
                <AlertCircle className="text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-1 rounded-full border border-rose-200/50" size={24} />
              ) : alert.severity === 'WARNING' ? (
                <AlertTriangle className="text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-1 rounded-full border border-amber-200/50" size={24} />
              ) : (
                <Info className="text-blue-500 bg-blue-50 dark:bg-blue-950/20 p-1 rounded-full border border-blue-200/50" size={24} />
              );

            return (
              <div key={alert.id} className="relative">
                {/* Timeline Dot Icon */}
                <div className="absolute -left-[33px] top-0.5">
                  {icon}
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="text-xs">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{alert.message}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <span>Source: `{alert.source}`</span>
                      <span>•</span>
                      <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => ackMutation.mutate(alert.id)}
                    disabled={ackMutation.isPending}
                    title="Acknowledge Alert"
                    className="p-1 rounded bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800 transition-colors shrink-0"
                  >
                    <Check size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic text-center py-4">No active incidents reported</p>
      )}
    </div>
  );
};

export default IncidentTimeline;
