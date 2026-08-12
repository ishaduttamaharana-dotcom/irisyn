import React from 'react';
import { AlertTriangle, Clock, Database, Inbox, Lock, RefreshCw, WifiOff } from 'lucide-react';

export type UIStateStatus = 'loading' | 'success' | 'empty' | 'stale' | 'offline' | 'error' | 'permissionDenied';

interface DataStateContainerProps {
  status: UIStateStatus;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  isStale?: boolean;
  isOffline?: boolean;
  isPermissionDenied?: boolean;
  errorMessage?: string;
  staleMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const DataStateContainer: React.FC<DataStateContainerProps> = ({
  status: initialStatus,
  isLoading,
  isError,
  isEmpty,
  isStale,
  isOffline,
  isPermissionDenied,
  errorMessage = 'An error occurred while communicating with the IRISYN platform API.',
  staleMessage = 'Telemetry data freshness exceeds latency threshold (>5000ms). Displaying buffered snapshot.',
  emptyTitle = 'No Records Available',
  emptyDescription = 'No data entities are currently active for this operational domain.',
  onRetry,
  children,
  className = '',
}) => {
  // Determine effective status
  let effectiveStatus: UIStateStatus = initialStatus;
  if (isLoading) effectiveStatus = 'loading';
  else if (isOffline) effectiveStatus = 'offline';
  else if (isPermissionDenied) effectiveStatus = 'permissionDenied';
  else if (isError) effectiveStatus = 'error';
  else if (isEmpty) effectiveStatus = 'empty';
  else if (isStale) effectiveStatus = 'stale';

  if (effectiveStatus === 'loading') {
    return (
      <div className={`p-8 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center min-h-[220px] text-center ${className}`}>
        <div className="relative flex items-center justify-center w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
          <Database className="w-5 h-5 text-cyan-400 animate-pulse" />
        </div>
        <p className="text-sm font-medium text-slate-300">Fetching Telemetry & Digital Twin State...</p>
        <p className="text-xs text-slate-500 mt-1">Establishing reactive API connection</p>
      </div>
    );
  }

  if (effectiveStatus === 'offline') {
    return (
      <div className={`p-8 rounded-xl bg-slate-950 border border-red-900/40 flex flex-col items-center justify-center min-h-[220px] text-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 mb-4">
          <WifiOff className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-red-300">IRISYN Backend Unreachable</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          Unable to establish connection with Quarkus API services (`/api`). Verify local server execution (`mvn quarkus:dev`).
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 text-xs font-medium bg-red-900/40 hover:bg-red-800/50 text-red-200 rounded-lg border border-red-700/50 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-check API Status
          </button>
        )}
      </div>
    );
  }

  if (effectiveStatus === 'permissionDenied') {
    return (
      <div className={`p-8 rounded-xl bg-slate-950 border border-amber-900/40 flex flex-col items-center justify-center min-h-[220px] text-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-amber-300">Access Restricted</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          Your active user role lacks permission to inspect or modify this subsystem. Contact your platform Administrator.
        </p>
      </div>
    );
  }

  if (effectiveStatus === 'error') {
    return (
      <div className={`p-8 rounded-xl bg-slate-950 border border-red-900/40 flex flex-col items-center justify-center min-h-[220px] text-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-red-300">API Execution Exception</h4>
        <p className="text-xs text-red-400/80 mt-1 font-mono max-w-md">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Action
          </button>
        )}
      </div>
    );
  }

  if (effectiveStatus === 'empty') {
    return (
      <div className={`p-8 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center min-h-[220px] text-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-400 mb-4">
          <Inbox className="w-6 h-6" />
        </div>
        <h4 className="text-base font-medium text-slate-300">{emptyTitle}</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isStale && (
        <div className="mb-4 p-3 rounded-lg bg-amber-950/30 border border-amber-800/50 flex items-center justify-between text-amber-300 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{staleMessage}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-2.5 py-1 text-[11px] bg-amber-900/40 hover:bg-amber-800/50 text-amber-200 rounded border border-amber-700/50 flex items-center gap-1 shrink-0"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default DataStateContainer;
