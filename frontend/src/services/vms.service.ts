import { apiClient } from './apiClient';
import { VirtualMachine } from '@/types/domain';

export const getVirtualMachines = async (): Promise<VirtualMachine[]> => {
  const { data } = await apiClient.get<VirtualMachine[]>('/vms');
  return data;
};
