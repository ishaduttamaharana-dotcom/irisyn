import { apiClient } from './apiClient';
import { Container } from '@/types/domain';

export const getContainers = async (): Promise<Container[]> => {
  const { data } = await apiClient.get<Container[]>('/containers');
  return data;
};
