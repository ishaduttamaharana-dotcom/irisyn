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
  (response) => {
    // If response body uses standard IRISYN envelope { data: ..., meta: ... }, unwrap payload
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const envelope = response.data as { data: any; meta?: any };
      // Attach meta to returned object if applicable
      const payload = envelope.data;
      if (payload && typeof payload === 'object' && !Array.isArray(payload) && envelope.meta) {
        payload._meta = envelope.meta;
      }
      return { ...response, data: payload };
    }
    return response;
  },
  (error: AxiosError) => {
    // Standard error envelope extraction: { error: { code, message } }
    const responseData = error.response?.data as { error?: { code?: string; message?: string }; message?: string } | undefined;
    const message =
      responseData?.error?.message ??
      responseData?.message ??
      error.message ??
      'Unexpected error contacting the IRISYN platform API';
    return Promise.reject(new Error(message));
  }
);
