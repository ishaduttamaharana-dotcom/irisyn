import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWebSocketUrl } from '@/services/socket.service';

export const useWebSocketMetrics = () => {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const connect = () => {
      const url = getWebSocketUrl();
      console.log('[WebSocket] Connecting to:', url);

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connection established');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // If we receive the aggregated cycle updates, feed them directly into the query cache
          if (data.servers) {
            queryClient.setQueryData(['servers'], data.servers);
          }
          if (data.alerts) {
            queryClient.setQueryData(['alerts'], data.alerts);
          }
          if (data.cluster) {
            queryClient.setQueryData(['cluster'], data.cluster);
          }
          if (data.metrics) {
            queryClient.setQueryData(['metrics'], data.metrics);
          }
        } catch (error) {
          console.warn('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error occurred:', error);
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Connection closed:', event.reason);
        // Attempt to reconnect in 3 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, 3000);
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        // Prevent reconnect loop on unmount
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [queryClient]);
};
