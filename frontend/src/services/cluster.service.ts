import { apiClient } from './apiClient';
import { ClusterSummary } from '@/types/domain';
import { mockCluster } from './mockData';

export const getClusterSummary = async (): Promise<ClusterSummary> => {
  try {
    const { data } = await apiClient.get<ClusterSummary>('/cluster');
    return data;
  } catch (err) {
    return mockCluster;
  }
};
