import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAlerts } from '@/services/alerts.service';
import { apiClient } from '@/services/apiClient';
import { AlertCircle, AlertTriangle, Info, Check, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { mockAlerts } from '@/services/mockData';

interface AlertItem {
  id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  source: string;
  createdAt: string;
  acknowledged: boolean;
}

const defaultIncidentEvents: AlertItem[] = [
  { id: 'INC-1005', severity: 'CRITICAL', message: 'MOTOR-001 Stator thermal temperature exceeded threshold (84°C)', source: 'MOTOR-001', createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(), acknowledged: false },
  { id: 'INC-1004', severity: 'WARNING', message: 'RMS vibration spike detected (4.8 mm/s)', source: 'MOTOR-001', createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(), acknowledged: false },
  { id: 'INC-1003', severity: 'WARNING', message: 'Hypervisor dc-node-03 CPU utilization > 92%', source: 'dc-node-03', createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), acknowledged: false },
  { id: 'INC-1002', severity: 'INFO', message: 'Local host laptop telemetry stream connected', source: 'LAPTOP-001', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), acknowledged: true },
  { id: 'INC-1001', severity: 'INFO', message: 'Digital Twin state engine model initialized', source: 'State Engine', createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), acknowledged: true },
];

const IncidentTimeline = () => {
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filterMode, setFilterMode] = useState<'ALL' | 'ACTIVE'>('ALL');

  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  // Fetch active alerts with fallback
  const { data: rawAlerts = [], refetch } = useQuery<AlertItem[]>({
    queryKey: ['alerts'],
    queryFn: getAlerts,
    retry: 1,
  });

  const alerts = rawAlerts.length > 0 ? rawAlerts : (mockAlerts as AlertItem[]) || defaultIncidentEvents;

  // Acknowledge alert mutation
  const ackMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/alerts/${id}/acknowledge`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const checkScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    
    const atTop = scrollTop <= 2;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 2;
    const hasMoreDown = scrollHeight > clientHeight && !atBottom;
    const hasMoreUp = !atTop;

    setIsAtTop(atTop);
    setIsAtBottom(atBottom);
    setCanScrollUp(hasMoreUp);
    setCanScrollDown(hasMoreDown);
  }, []);

  useEffect(() => {
    checkScrollState();
    window.addEventListener('resize', checkScrollState);
    return () => window.removeEventListener('resize', checkScrollState);
  }, [checkScrollState, alerts]);

  const scrollUp = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: -250, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: 250, behavior: 'smooth' });
    }
  };

  const displayedAlerts = filterMode === 'ACTIVE'
    ? alerts.filter((a) => !a.acknowledged)
    : alerts;

  return (
    <div className="card relative overflow-hidden flex flex-col h-[420px] max-h-[420px] bg-slate-900 border-slate-800 text-slate-100">
      {/* Sticky Header */}
      <div className="p-3.5 px-4 border-b border-slate-800 shrink-0 flex items-center justify-between bg-slate-950/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-slate-100">Incident Timeline</h4>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
            {alerts.filter((a) => !a.acknowledged).length} Active
          </span>
        </div>

        {/* Filter Toggle & Scroll Controls */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-800 p-0.5 text-[10px] font-mono font-bold">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2 py-0.5 rounded ${filterMode === 'ALL' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilterMode('ACTIVE')}
              className={`px-2 py-0.5 rounded ${filterMode === 'ACTIVE' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              ACTIVE
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={scrollUp}
              disabled={isAtTop}
              title="Scroll up"
              className="p-1 rounded text-slate-400 hover:bg-slate-800 disabled:opacity-30 transition-opacity"
            >
              <ChevronUp size={15} />
            </button>
            <button
              onClick={scrollDown}
              disabled={isAtBottom}
              title="Scroll down"
              className="p-1 rounded text-slate-400 hover:bg-slate-800 disabled:opacity-30 transition-opacity"
            >
              <ChevronDown size={15} />
            </button>
            <button
              onClick={() => refetch()}
              title="Refresh Incident Timeline"
              className="p-1 rounded hover:bg-slate-800 text-slate-400"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Internal Scrollable Stream */}
      <div
        ref={scrollRef}
        onScroll={checkScrollState}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative scrollbar-thin scrollbar-thumb-slate-700"
      >
        {displayedAlerts.length > 0 ? (
          <div className="relative border-l border-slate-800 ml-3 pl-5 space-y-4 py-1">
            {displayedAlerts.map((alert) => {
              const icon =
                alert.severity === 'CRITICAL' ? (
                  <AlertCircle className="text-rose-400 bg-rose-950/40 p-1 rounded-full border border-rose-500/40 shrink-0" size={24} />
                ) : alert.severity === 'WARNING' ? (
                  <AlertTriangle className="text-amber-400 bg-amber-950/40 p-1 rounded-full border border-amber-500/40 shrink-0" size={24} />
                ) : (
                  <Info className="text-blue-400 bg-blue-950/40 p-1 rounded-full border border-blue-500/40 shrink-0" size={24} />
                );

              return (
                <div key={alert.id} className="relative group">
                  {/* Timeline Icon */}
                  <div className="absolute -left-[33px] top-0.5">
                    {icon}
                  </div>

                  <div className="flex items-start justify-between gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                    <div className="text-xs">
                      <p className="font-semibold text-slate-100 leading-snug">{alert.message}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>Source: <strong className="text-purple-300">{alert.source}</strong></span>
                        <span>•</span>
                        <span>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {!alert.acknowledged && (
                      <button
                        onClick={() => ackMutation.mutate(alert.id)}
                        disabled={ackMutation.isPending}
                        title="Acknowledge Alert"
                        className="p-1.5 rounded bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white border border-slate-700 transition-colors shrink-0 font-sans font-bold text-[10px] flex items-center gap-1"
                      >
                        <Check size={12} /> Ack
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-slate-500 italic text-center font-mono">No active incidents reported</p>
          </div>
        )}
      </div>

      {/* Subtle Top & Bottom Scroll Gradients */}
      {canScrollUp && (
        <div className="absolute top-[49px] left-0 right-0 h-4 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none z-10" />
      )}
      {canScrollDown && (
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none z-10" />
      )}
    </div>
  );
};

export default IncidentTimeline;
