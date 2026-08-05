import { Alert } from '@/types/domain';
import Badge from '../ui/Badge';

const AlertsPanel = ({ alerts }: { alerts: Alert[] }) => (
  <div className="card p-4">
    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">Alerts</p>
    <ul className="space-y-3">
      {alerts.map((alert) => (
        <li key={alert.id} className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-200">{alert.message}</p>
            <p className="text-xs text-slate-400">{alert.source}</p>
          </div>
          <Badge status={alert.severity} />
        </li>
      ))}
    </ul>
  </div>
);

export default AlertsPanel;
