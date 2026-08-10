import { apiClient } from './apiClient';
import { Alert } from '@/types/domain';
import { mockAlerts } from './mockData';

export const getAlerts = async (): Promise<Alert[]> => {
  try {
    const { data } = await apiClient.get<Alert[]>('/alerts');
    return data;
  } catch (err) {
    return mockAlerts;
  }
};

export const acknowledgeAlert = async (id: string): Promise<Alert> => {
  try {
    const { data } = await apiClient.put<Alert>(`/alerts/${id}/acknowledge`);
    return data;
  } catch (err) {
    const alert = mockAlerts.find((a) => a.id === id) || mockAlerts[0];
    return { ...alert, acknowledged: true };
  }
};
