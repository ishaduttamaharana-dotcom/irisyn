export interface AppConfig {
  appName: string;
  tagline: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  apiBaseUrl: string;
  wsBaseUrl: string;
  telemetryFreshnessThresholdMs: number;
  autoRefreshIntervalMs: number;
  dataSources: {
    realTimeLocal: {
      key: 'REAL-TIME LOCAL';
      label: 'REAL-TIME LOCAL';
      description: 'Host hardware telemetry collected directly from local machine';
      badgeVariant: 'emerald';
    };
    simulated: {
      key: 'SIMULATED';
      label: 'SIMULATED';
      description: 'Physics-based synthetic industrial telemetry (MOTOR-001, PUMP-001)';
      badgeVariant: 'amber';
    };
    targetFuture: {
      key: 'TARGET / FUTURE';
      label: 'TARGET / FUTURE';
      description: 'Future industrial edge protocol integration (PLC, MQTT, OPC-UA, Modbus, Red Hat Edge)';
      badgeVariant: 'purple';
    };
  };
}

export const APP_CONFIG: AppConfig = {
  appName: 'IRISYN',
  tagline: 'Digital Twin Platform',
  version: '1.0.0-phase1',
  environment: (import.meta.env.VITE_ENV as 'development' | 'staging' | 'production') || 'development',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080/ws',
  telemetryFreshnessThresholdMs: 5000,
  autoRefreshIntervalMs: 3000,
  dataSources: {
    realTimeLocal: {
      key: 'REAL-TIME LOCAL',
      label: 'REAL-TIME LOCAL',
      description: 'Host hardware telemetry collected directly from local machine',
      badgeVariant: 'emerald',
    },
    simulated: {
      key: 'SIMULATED',
      label: 'SIMULATED',
      description: 'Physics-based synthetic industrial telemetry (MOTOR-001, PUMP-001)',
      badgeVariant: 'amber',
    },
    targetFuture: {
      key: 'TARGET / FUTURE',
      label: 'TARGET / FUTURE',
      description: 'Future industrial edge protocol integration (PLC, MQTT, OPC-UA, Modbus, Red Hat Edge)',
      badgeVariant: 'purple',
    },
  },
};
