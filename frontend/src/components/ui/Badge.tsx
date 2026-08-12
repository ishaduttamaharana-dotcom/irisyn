import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, WifiOff, Info } from 'lucide-react';
import clsx from 'clsx';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  size = 'md',
  children,
  className = '',
}) => {
  const norm = status?.toUpperCase() || 'UNKNOWN';

  let baseStyles = 'inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-md transition-colors border';
  if (size === 'sm') {
    baseStyles += ' px-2 py-0.5 text-[10px]';
  } else {
    baseStyles += ' px-2.5 py-1 text-xs';
  }

  if (norm === 'HEALTHY' || norm === 'RUNNING' || norm === 'ONLINE') {
    return (
      <span className={clsx(baseStyles, 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>{children ?? norm}</span>
      </span>
    );
  }

  if (norm === 'WARNING' || norm === 'PENDING' || norm === 'DEGRADATION') {
    return (
      <span className={clsx(baseStyles, 'bg-amber-500/10 text-amber-400 border-amber-500/30', className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        <span>{children ?? norm}</span>
      </span>
    );
  }

  if (norm === 'CRITICAL' || norm === 'CRASHLOOP' || norm === 'FAULT') {
    return (
      <span className={clsx(baseStyles, 'bg-red-500/10 text-red-400 border-red-500/30', className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
        <span>{children ?? norm}</span>
      </span>
    );
  }

  if (norm === 'INFO') {
    return (
      <span className={clsx(baseStyles, 'bg-sky-500/10 text-sky-300 border-sky-500/30', className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
        <Info className="w-3.5 h-3.5 text-sky-300" />
        <span>{children ?? norm}</span>
      </span>
    );
  }

  // OFFLINE / STOPPED / UNKNOWN
  return (
    <span className={clsx(baseStyles, 'bg-slate-800/80 text-slate-400 border-slate-700', className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
      <WifiOff className="w-3.5 h-3.5 text-slate-400" />
      <span>{children ?? norm}</span>
    </span>
  );
};

export default Badge;
