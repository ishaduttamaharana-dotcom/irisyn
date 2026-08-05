import clsx from 'clsx';
import React from 'react';

const TONE_MAP: Record<string, string> = {
  HEALTHY: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-300',
  RUNNING: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-700/20 dark:text-emerald-300',
  WARNING: 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300',
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-700/20 dark:text-amber-300',
  CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300',
  CRASHLOOP: 'bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-300',
  OFFLINE: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  STOPPED: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  INFO: 'bg-sky-100 text-sky-700 dark:bg-sky-700/20 dark:text-sky-300',
};

const Badge = ({ status, children }: { status: string; children?: React.ReactNode }) => (
  <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', TONE_MAP[status] ?? TONE_MAP.OFFLINE)}>
    {children ?? status}
  </span>
);

export default Badge;
