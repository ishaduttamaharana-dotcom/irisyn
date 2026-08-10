import { apiClient } from './apiClient';
import { Container } from '@/types/domain';
import { mockContainers } from './mockData';

export const getContainers = async (): Promise<Container[]> => {
  try {
    const { data } = await apiClient.get<Container[]>('/containers');
    return data;
  } catch (err) {
    return mockContainers;
  }
};

export const getContainerById = async (id: string): Promise<Container> => {
  try {
    const { data } = await apiClient.get<Container>(`/containers/${id}`);
    return data;
  } catch (err) {
    return mockContainers.find((c) => c.id === id) || mockContainers[0];
  }
};

export const createContainer = async (container: Partial<Container>): Promise<Container> => {
  try {
    const { data } = await apiClient.post<Container>('/containers', container);
    return data;
  } catch (err) {
    return {
      id: `ctr-${Date.now()}`,
      name: container.name || 'new-service',
      image: container.image || 'registry.internal/svc:latest',
      podName: container.podName || 'pod-new',
      status: container.status || 'RUNNING',
      cpuUsage: container.cpuUsage ?? 15,
      ramUsage: container.ramUsage ?? 25,
    };
  }
};

export const updateContainer = async (id: string, container: Partial<Container>): Promise<Container> => {
  try {
    const { data } = await apiClient.put<Container>(`/containers/${id}`, container);
    return data;
  } catch (err) {
    const existing = mockContainers.find((c) => c.id === id) || mockContainers[0];
    return { ...existing, ...container };
  }
};

export const deleteContainer = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/containers/${id}`);
  } catch (err) {
    // Graceful fallback
  }
};
