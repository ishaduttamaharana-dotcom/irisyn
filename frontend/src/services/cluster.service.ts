import { apiClient } from './apiClient';
import { ClusterSummary } from '@/types/domain';

export const getClusterSummary = async (): Promise<ClusterSummary> => {
  const { data } = await apiClient.get<ClusterSummary>('/cluster');
  return data;
};
