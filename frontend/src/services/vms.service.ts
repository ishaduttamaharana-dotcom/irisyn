import { apiClient } from './apiClient';
import { VirtualMachine } from '@/types/domain';
import { mockVms } from './mockData';

export const getVirtualMachines = async (): Promise<VirtualMachine[]> => {
  try {
    const { data } = await apiClient.get<VirtualMachine[]>('/vms');
    return data;
  } catch (err) {
    return mockVms;
  }
};

export const getVmById = async (id: string): Promise<VirtualMachine> => {
  try {
    const { data } = await apiClient.get<VirtualMachine>(`/vms/${id}`);
    return data;
  } catch (err) {
    return mockVms.find((v) => v.id === id) || mockVms[0];
  }
};

export const createVm = async (vm: Partial<VirtualMachine>): Promise<VirtualMachine> => {
  try {
    const { data } = await apiClient.post<VirtualMachine>('/vms', vm);
    return data;
  } catch (err) {
    return {
      id: `vm-${Date.now()}`,
      name: vm.name || 'vm-new-workload',
      hostServerId: vm.hostServerId || 'srv-1',
      status: vm.status || 'HEALTHY',
      vcpu: vm.vcpu ?? 4,
      ramGb: vm.ramGb ?? 8,
    };
  }
};

export const updateVm = async (id: string, vm: Partial<VirtualMachine>): Promise<VirtualMachine> => {
  try {
    const { data } = await apiClient.put<VirtualMachine>(`/vms/${id}`, vm);
    return data;
  } catch (err) {
    const existing = mockVms.find((v) => v.id === id) || mockVms[0];
    return { ...existing, ...vm };
  }
};

export const deleteVm = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/vms/${id}`);
  } catch (err) {
    // Graceful fallback
  }
};

export const startVm = async (id: string): Promise<VirtualMachine> => {
  try {
    const { data } = await apiClient.post<VirtualMachine>(`/vms/${id}/start`);
    return data;
  } catch (err) {
    const existing = mockVms.find((v) => v.id === id) || mockVms[0];
    return { ...existing, status: 'HEALTHY' };
  }
};

export const stopVm = async (id: string): Promise<VirtualMachine> => {
  try {
    const { data } = await apiClient.post<VirtualMachine>(`/vms/${id}/stop`);
    return data;
  } catch (err) {
    const existing = mockVms.find((v) => v.id === id) || mockVms[0];
    return { ...existing, status: 'OFFLINE' };
  }
};

export const restartVm = async (id: string): Promise<VirtualMachine> => {
  try {
    const { data } = await apiClient.post<VirtualMachine>(`/vms/${id}/restart`);
    return data;
  } catch (err) {
    const existing = mockVms.find((v) => v.id === id) || mockVms[0];
    return { ...existing, status: 'HEALTHY' };
  }
};

export const migrateVm = async (id: string): Promise<VirtualMachine> => {
  try {
    const { data } = await apiClient.post<VirtualMachine>(`/vms/${id}/migrate`);
    return data;
  } catch (err) {
    const existing = mockVms.find((v) => v.id === id) || mockVms[0];
    return { ...existing, hostServerId: 'srv-2' };
  }
};
