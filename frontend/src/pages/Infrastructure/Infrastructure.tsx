import DashboardLayout from '@/layouts/DashboardLayout';
import DigitalTwinView from '@/components/digital-twin/DigitalTwinView';

const Infrastructure = () => (
  <DashboardLayout title="Infrastructure" description="Rack and node topology (mock data)">
    <DigitalTwinView />
  </DashboardLayout>
);

export default Infrastructure;
