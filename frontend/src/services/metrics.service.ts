import { apiClient } from './apiClient';
import { MetricPoint } from '@/types/domain';

export const getMetrics = async (): Promise<MetricPoint[]> => {
  const { data } = await apiClient.get<MetricPoint[]>('/metrics');
  return data;
};
