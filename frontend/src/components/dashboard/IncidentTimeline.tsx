import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAlerts } from '@/services/alerts.service';
import { apiClient } from '@/services/apiClient';
import { AlertCircle, AlertTriangle, Info, Check, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';

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
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      scrollRef.current.scrollBy({ top: -60, behavior: 'smooth' });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      scrollRef.current.scrollBy({ top: 60, behavior: 'smooth' });
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      scrollRef.current.scrollBy({ top: -250, behavior: 'smooth' });
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      scrollRef.current.scrollBy({ top: 250, behavior: 'smooth' });
    } else if (e.key === 'Home') {
      e.preventDefault();
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="card p-4 animate-pulse space-y-3 h-[320px] md:h-[380px] lg:h-[420px]">
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="card relative overflow-hidden flex flex-col h-[320px] md:h-[380px] lg:h-[420px] max-h-[420px]">
      {/* Sticky Header */}
      <div className="p-3.5 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Incident Timeline</h4>
          {activeAlerts.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {activeAlerts.length} Active
            </span>
          )}
        </div>

        {/* Header Controls: Scroll Up / Down & Refresh */}
        <div className="flex items-center gap-1">
          <button
            onClick={scrollUp}
            disabled={isAtTop}
            title="Scroll up"
            className="p-1 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-opacity"
          >
            <ChevronUp size={15} />
          </button>
          <button
            onClick={scrollDown}
            disabled={isAtBottom}
            title="Scroll down"
            className="p-1 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-opacity"
          >
            <ChevronDown size={15} />
          </button>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />
          <button
            onClick={() => refetch()}
            title="Refresh Incident Timeline"
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Subtle Top Gradient Indicator */}
      {canScrollUp && (
        <div className="absolute top-[49px] left-0 right-0 h-4 bg-gradient-to-b from-slate-200/40 dark:from-slate-900/80 to-transparent pointer-events-none z-10" />
      )}

      {/* Internal Scrollable Content */}
      <div
        ref={scrollRef}
        onScroll={checkScrollState}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label="Incident Timeline Events"
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 p-4 relative outline-none focus:ring-1 focus:ring-purple-500/20"
      >
        {activeAlerts.length > 0 ? (
          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 pl-5 space-y-4 py-1">
            {activeAlerts.map((alert) => {
              const icon =
                alert.severity === 'CRITICAL' ? (
                  <AlertCircle className="text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-1 rounded-full border border-rose-200/50 shrink-0" size={24} />
                ) : alert.severity === 'WARNING' ? (
                  <AlertTriangle className="text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-1 rounded-full border border-amber-200/50 shrink-0" size={24} />
                ) : (
                  <Info className="text-blue-500 bg-blue-50 dark:bg-blue-950/20 p-1 rounded-full border border-blue-200/50 shrink-0" size={24} />
                );

              return (
                <div key={alert.id} className="relative group">
                  {/* Timeline Icon */}
                  <div className="absolute -left-[33px] top-0.5">
                    {icon}
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="text-xs">
                      <p className="font-semibold text-slate-700 dark:text-slate-200 leading-snug">{alert.message}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <span>Source: <code className="font-mono text-slate-300">{alert.source}</code></span>
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
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-slate-400 italic text-center">No active incidents reported</p>
          </div>
        )}
      </div>

      {/* Subtle Bottom Gradient Indicator */}
      {canScrollDown && (
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-200/40 dark:from-slate-900/80 to-transparent pointer-events-none z-10" />
      )}
    </div>
  );
};

export default IncidentTimeline;
