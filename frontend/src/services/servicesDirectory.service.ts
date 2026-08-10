import { apiClient } from './apiClient';
import { ServiceDirectoryItem, ServiceLineage } from '@/types/domain';
import { mockServiceDirectory, mockServiceLineage } from './mockData';

export const getServiceDirectory = async (): Promise<ServiceDirectoryItem[]> => {
  try {
    const { data } = await apiClient.get<ServiceDirectoryItem[]>('/services/directory');
    return data;
  } catch (err) {
    return mockServiceDirectory;
  }
};

export const getServiceLineage = async (): Promise<ServiceLineage[]> => {
  try {
    const { data } = await apiClient.get<ServiceLineage[]>('/services/lineage');
    return data;
  } catch (err) {
    return mockServiceLineage;
  }
};
