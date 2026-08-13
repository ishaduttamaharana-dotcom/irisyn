import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWebSocketUrl } from '@/services/socket.service';
import { getLiveTelemetry } from '@/services/telemetry.service';

export const useWebSocketMetrics = () => {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<number | null>(null);
  const backoffRef = useRef<number>(1000); // Initial backoff 1s

  const [connectionState, setConnectionState] = useState<'CONNECTED' | 'RECONNECTING' | 'OFFLINE'>('OFFLINE');

  useEffect(() => {
    const resyncState = async () => {
      try {
        const telemetryData = await getLiveTelemetry();
        if (telemetryData) {
          queryClient.setQueryData(['liveTelemetry'], telemetryData);
          queryClient.invalidateQueries({ queryKey: ['assets'] });
          queryClient.invalidateQueries({ queryKey: ['systemInfo'] });
        }
      } catch (e) {
        // ignore transient errors
      }
    };

    const startPollingFallback = () => {
      if (pollIntervalRef.current) return;
      pollIntervalRef.current = window.setInterval(() => {
        resyncState();
      }, 1500);
    };

    const connect = () => {
      const url = getWebSocketUrl();
      try {
        setConnectionState('RECONNECTING');
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[WebSocket] Connection established — resynchronizing state...');
          setConnectionState('CONNECTED');
          backoffRef.current = 1000; // Reset backoff delay on successful connection
          resyncState();
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
          setConnectionState('RECONNECTING');
          startPollingFallback();
        };

        ws.onclose = () => {
          setConnectionState('RECONNECTING');
          startPollingFallback();
          
          // Exponential backoff reconnect: min 1s, max 30s
          const delay = Math.min(backoffRef.current, 30000);
          backoffRef.current = backoffRef.current * 1.5;

          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, delay);
        };
      } catch (e) {
        setConnectionState('OFFLINE');
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

  return { connectionState };
};
