import { apiClient } from './apiClient';
import { Server } from '@/types/domain';

export const getServers = async (): Promise<Server[]> => {
  const { data } = await apiClient.get<Server[]>('/servers');
  return data;
};
