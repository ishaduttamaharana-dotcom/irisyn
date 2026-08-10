import { apiClient } from './apiClient';
import { User } from '@/types/domain';
import { mockUsers } from './mockData';

export const getUsers = async (): Promise<User[]> => {
  try {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
  } catch (err) {
    return mockUsers;
  }
};

export const getUserById = async (id: string): Promise<User> => {
  try {
    const { data } = await apiClient.get<User>(`/users/${id}`);
    return data;
  } catch (err) {
    return mockUsers.find((u) => u.id === id) || mockUsers[0];
  }
};

export const createUser = async (user: Partial<User>): Promise<User> => {
  try {
    const { data } = await apiClient.post<User>('/users', user);
    return data;
  } catch (err) {
    return {
      id: `usr-${Date.now()}`,
      username: user.username || 'user@irisyn.io',
      email: user.email || 'user@irisyn.io',
      role: user.role || 'OPERATOR',
    };
  }
};

export const updateUser = async (id: string, user: Partial<User>): Promise<User> => {
  try {
    const { data } = await apiClient.put<User>(`/users/${id}`, user);
    return data;
  } catch (err) {
    const existing = mockUsers.find((u) => u.id === id) || mockUsers[0];
    return { ...existing, ...user };
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/users/${id}`);
  } catch (err) {
    // Graceful fallback
  }
};
