import clsx from 'clsx';

const Spinner = ({ size = 24, className }: { size?: number; className?: string }) => (
  <div
    className={clsx('animate-spin rounded-full border-2 border-slate-300 border-t-brand-500', className)}
    style={{ width: size, height: size }}
    role="status"
    aria-label="Loading"
  />
);

export default Spinner;
