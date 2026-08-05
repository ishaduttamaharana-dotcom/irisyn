import DashboardLayout from '@/layouts/DashboardLayout';
import { ShieldCheck } from 'lucide-react';

const Security = () => (
  <DashboardLayout title="Security" description="Access control and compliance posture (placeholder)">
    <div className="card p-10 flex flex-col items-center justify-center text-center gap-2">
      <ShieldCheck size={28} className="text-brand-500" />
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
        Security posture, RBAC, and audit logs will be surfaced here once the backend security module is implemented.
      </p>
    </div>
  </DashboardLayout>
);

export default Security;
