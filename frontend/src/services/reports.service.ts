import { apiClient } from './apiClient';
import { ReportItem } from '@/types/domain';

export const getReports = async (): Promise<ReportItem[]> => {
  try {
    const response = await apiClient.get<ReportItem[]>('/reports');
    return response.data;
  } catch (err) {
    return [
      {
        id: 'REP-001',
        title: 'Digital Twin Asset Health Summary Report',
        category: 'HEALTH',
        generatedAt: new Date(Date.now() - 86400000).toISOString(),
        generatedBy: 'IRISYN System',
        format: 'PDF',
        downloadUrl: '/api/reports/REP-001/download',
      },
      {
        id: 'REP-002',
        title: 'Host Telemetry Freshness & Latency Audit',
        category: 'TELEMETRY',
        generatedAt: new Date(Date.now() - 172800000).toISOString(),
        generatedBy: 'Admin User',
        format: 'CSV',
        downloadUrl: '/api/reports/REP-002/download',
      },
    ];
  }
};
