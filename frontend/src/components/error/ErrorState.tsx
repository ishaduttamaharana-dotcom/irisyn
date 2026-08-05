import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState = ({ message = 'Something went wrong while loading this data.', onRetry }: ErrorStateProps) => (
  <div className="card flex flex-col items-center justify-center gap-3 p-8 text-center">
    <AlertTriangle className="text-red-500" size={28} />
    <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
      >
        Retry
      </button>
    )}
  </div>
);

export default ErrorState;
