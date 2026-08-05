import axios, { AxiosError, AxiosInstance } from 'axios';

const rawUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';
const BASE_URL =
  typeof window !== 'undefined' &&
  window.location.protocol === 'https:' &&
  rawUrl.includes('localhost')
    ? '/api'
    : rawUrl;

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('dt-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Centralized error normalization; UI layer decides how to display it.
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      'Unexpected error contacting the API';
    return Promise.reject(new Error(message));
  }
);
