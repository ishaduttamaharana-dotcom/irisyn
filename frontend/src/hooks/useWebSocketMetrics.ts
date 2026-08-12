import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWebSocketUrl } from '@/services/socket.service';
import { getLiveTelemetry } from '@/services/telemetry.service';

export const useWebSocketMetrics = () => {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Establish high-frequency fallback poll to guarantee continuous live laptop telemetry
    const startPollingFallback = () => {
      if (pollIntervalRef.current) return;
      pollIntervalRef.current = window.setInterval(async () => {
        try {
          const telemetryData = await getLiveTelemetry();
          if (telemetryData) {
            queryClient.setQueryData(['liveTelemetry'], telemetryData);
            queryClient.invalidateQueries({ queryKey: ['assets'] });
            queryClient.invalidateQueries({ queryKey: ['systemInfo'] });
          }
        } catch (e) {
          // ignore transient network poll errors
        }
      }, 1500);
    };

    const connect = () => {
      const url = getWebSocketUrl();
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[WebSocket] Connection established for real-time telemetry stream');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.metrics) {
              queryClient.setQueryData(['metrics'], data.metrics);
            }
            if (data.servers) {
              queryClient.setQueryData(['servers'], data.servers);
            }
            if (data.telemetry) {
              queryClient.setQueryData(['liveTelemetry'], data.telemetry);
            }
          } catch (error) {
            console.warn('[WebSocket] Failed to parse message:', error);
          }
        };

        ws.onerror = () => {
          startPollingFallback();
        };

        ws.onclose = () => {
          startPollingFallback();
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, 3000);
        };
      } catch (e) {
        startPollingFallback();
      }
    };

    connect();
    startPollingFallback();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
      }
    };
  }, [queryClient]);
};
