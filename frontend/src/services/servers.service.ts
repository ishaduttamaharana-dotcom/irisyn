import { apiClient } from './apiClient';
import { Server } from '@/types/domain';
import { mockServers } from './mockData';

export const getServers = async (): Promise<Server[]> => {
  try {
    const { data } = await apiClient.get<Server[]>('/servers');
    return data;
  } catch (err) {
    return mockServers;
  }
};

export const getServerById = async (id: string): Promise<Server> => {
  try {
    const { data } = await apiClient.get<Server>(`/servers/${id}`);
    return data;
  } catch (err) {
    return mockServers.find((s) => s.id === id) || mockServers[0];
  }
};

export const createServer = async (server: Partial<Server>): Promise<Server> => {
  try {
    const { data } = await apiClient.post<Server>('/servers', server);
    return data;
  } catch (err) {
    return {
      id: `srv-${Date.now()}`,
      hostname: server.hostname || 'dc-node-new',
      rack: server.rack || 'Rack A',
      status: server.status || 'HEALTHY',
      cpuUsage: server.cpuUsage ?? 25,
      ramUsage: server.ramUsage ?? 40,
      diskUsage: server.diskUsage ?? 30,
      temperatureC: server.temperatureC ?? 42,
      uptimeHours: server.uptimeHours ?? 1,
    };
  }
};

export const updateServer = async (id: string, server: Partial<Server>): Promise<Server> => {
  try {
    const { data } = await apiClient.put<Server>(`/servers/${id}`, server);
    return data;
  } catch (err) {
    const existing = mockServers.find((s) => s.id === id) || mockServers[0];
    return { ...existing, ...server };
  }
};

export const deleteServer = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/servers/${id}`);
  } catch (err) {
    // Graceful fallback
  }
};
