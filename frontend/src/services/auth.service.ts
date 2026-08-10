import { apiClient } from './apiClient';
import { LoginRequest, LoginResponse } from '@/types/domain';

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
  if (data.token) {
    localStorage.setItem('dt-token', data.token);
    localStorage.setItem('dt-user', JSON.stringify(data));
  }
  return data;
};

export const logout = (): void => {
  localStorage.removeItem('dt-token');
  localStorage.removeItem('dt-user');
};

export const getStoredAuthToken = (): string | null => {
  return localStorage.getItem('dt-token');
};
