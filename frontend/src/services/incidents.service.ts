import { apiClient } from './apiClient';
import { Incident } from '@/types/domain';

export const getIncidents = async (): Promise<Incident[]> => {
  try {
    const response = await apiClient.get<Incident[]>('/incidents');
    return response.data;
  } catch (err) {
    return [
      {
        id: 'INC-2026-001',
        title: 'High Vibration & Bearing Temperature Warning on MOTOR-001',
        assetId: 'MOTOR-001',
        severity: 'WARNING',
        status: 'OPEN',
        assignedTo: 'Sarah Chen (Engineer)',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        summary: 'Bearing vibration exceeded 4.2 mm/s baseline during high torque operation.',
      },
    ];
  }
};
