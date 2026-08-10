import { apiClient } from './apiClient';
import { MetricPoint } from '@/types/domain';
import { mockMetrics } from './mockData';

export const getMetrics = async (): Promise<MetricPoint[]> => {
  try {
    const { data } = await apiClient.get<MetricPoint[]>('/metrics');
    return data;
  } catch (err) {
    return mockMetrics;
  }
};
