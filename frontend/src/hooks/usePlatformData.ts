import { useQuery } from '@tanstack/react-query';
import {
  getSystemInfo,
  getAssets,
  getAssetById,
  getIncidents,
  getMaintenanceOrders,
  getIntegrations,
  getDiagnostics,
  getReports,
} from '../services';

export const useSystemInfo = () => {
  return useQuery({
    queryKey: ['systemInfo'],
    queryFn: getSystemInfo,
    refetchInterval: 5000,
  });
};

export const useAssets = (source?: string) => {
  return useQuery({
    queryKey: ['assets', source],
    queryFn: () => getAssets(source),
    refetchInterval: 3000,
  });
};

export const useAssetDetail = (id: string) => {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: () => getAssetById(id),
    refetchInterval: 2000,
    enabled: Boolean(id),
  });
};

export const useIncidents = () => {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: getIncidents,
    refetchInterval: 5000,
  });
};

export const useMaintenanceOrders = () => {
  return useQuery({
    queryKey: ['maintenance'],
    queryFn: getMaintenanceOrders,
    refetchInterval: 5000,
  });
};

export const useIntegrations = () => {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: getIntegrations,
    refetchInterval: 10000,
  });
};

export const useDiagnostics = () => {
  return useQuery({
    queryKey: ['diagnostics'],
    queryFn: getDiagnostics,
    refetchInterval: 10000,
  });
};

export const useReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: getReports,
    refetchInterval: 15000,
  });
};
