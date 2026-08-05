import { ReactNode } from 'react';
import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

const TONE_MAP: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-brand-50 text-brand-600 dark:bg-brand-700/20 dark:text-brand-200',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-700/20 dark:text-emerald-200',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-700/20 dark:text-amber-200',
  danger: 'bg-red-50 text-red-600 dark:bg-red-700/20 dark:text-red-200',
};

const StatCard = ({ label, value, icon, trend, tone = 'default' }: StatCardProps) => (
  <div className="card p-4 flex items-center justify-between">
    <div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-800 dark:text-slate-100">{value}</p>
      {trend && (
        <p className={clsx('mt-1 text-xs font-medium', trend.positive ? 'text-emerald-500' : 'text-red-500')}>
          {trend.value}
        </p>
      )}
    </div>
    <div className={clsx('h-10 w-10 rounded-lg flex items-center justify-center', TONE_MAP[tone])}>{icon}</div>
  </div>
);

export default StatCard;
