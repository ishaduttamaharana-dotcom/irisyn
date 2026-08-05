const ACTIVITY = [
  { id: 1, text: 'Automation job "nightly-backup" completed successfully', time: '2m ago' },
  { id: 2, text: 'VM vm-workload-3 migrated to dc-node-07', time: '18m ago' },
  { id: 3, text: 'AI Insights flagged anomaly on dc-node-04', time: '41m ago' },
  { id: 4, text: 'User Isha updated cluster scaling policy', time: '1h ago' },
];

const RecentActivity = () => (
  <div className="card p-4">
    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">Recent Activity</p>
    <ul className="space-y-3">
      {ACTIVITY.map((item) => (
        <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
          <span className="text-slate-600 dark:text-slate-300">{item.text}</span>
          <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default RecentActivity;
