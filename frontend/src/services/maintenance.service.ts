import { apiClient } from './apiClient';
import { MaintenanceWorkOrder } from '@/types/domain';

export const getMaintenanceOrders = async (): Promise<MaintenanceWorkOrder[]> => {
  try {
    const response = await apiClient.get<MaintenanceWorkOrder[]>('/maintenance');
    return response.data;
  } catch (err) {
    return [
      {
        id: 'WO-9041',
        assetId: 'MOTOR-001',
        assetName: 'Siemens 150kW Industrial Motor',
        type: 'PREDICTIVE',
        priority: 'HIGH',
        status: 'PLANNED',
        description: 'Inspect drive shaft alignment and grease drive-end bearings based on vibration trend.',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        assignedEngineer: 'Alex Rivera (Senior Tech)',
        estimatedHours: 2.5,
      },
    ];
  }
};
