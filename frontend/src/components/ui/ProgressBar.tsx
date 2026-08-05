import clsx from 'clsx';

const ProgressBar = ({ value, tone = 'default' }: { value: number; tone?: 'default' | 'warning' | 'danger' }) => {
  const color =
    tone === 'danger' ? 'bg-red-500' : tone === 'warning' ? 'bg-amber-500' : value > 80 ? 'bg-red-500' : 'bg-brand-500';
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
      <div className={clsx('h-1.5 rounded-full', color)} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
};

export default ProgressBar;
