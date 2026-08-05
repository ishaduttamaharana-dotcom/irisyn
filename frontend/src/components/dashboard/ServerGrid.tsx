import { Server } from '@/types/domain';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';

const ServerGrid = ({ servers }: { servers: Server[] }) => (
  <div className="card p-4">
    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">Server Grid</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {servers.map((server) => (
        <div key={server.id} className="rounded-lg border border-slate-100 dark:border-slate-800 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{server.hostname}</p>
            <Badge status={server.status} />
          </div>
          <p className="text-xs text-slate-400 mb-2">{server.rack}</p>
          <div className="space-y-1.5">
            <div>
              <p className="text-[10px] text-slate-400">CPU {server.cpuUsage}%</p>
              <ProgressBar value={server.cpuUsage} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400">RAM {server.ramUsage}%</p>
              <ProgressBar value={server.ramUsage} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ServerGrid;
