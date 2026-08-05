import DashboardLayout from '@/layouts/DashboardLayout';
import AutomationStatus from '@/components/dashboard/AutomationStatus';

const Automation = () => (
  <DashboardLayout title="Automation" description="Automation jobs and recovery workflows (mock data)">
    <AutomationStatus />
  </DashboardLayout>
);

export default Automation;
