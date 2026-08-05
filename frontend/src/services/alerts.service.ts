import { apiClient } from './apiClient';
import { Alert } from '@/types/domain';

export const getAlerts = async (): Promise<Alert[]> => {
  const { data } = await apiClient.get<Alert[]>('/alerts');
  return data;
};
