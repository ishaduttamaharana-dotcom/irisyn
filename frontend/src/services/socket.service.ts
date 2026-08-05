const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8080/ws/metrics';

export const getWebSocketUrl = (): string => {
  if (WS_URL.startsWith('ws://') || WS_URL.startsWith('wss://')) {
    return WS_URL;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  // If it's a relative path, resolve it relative to the current host
  const path = WS_URL.startsWith('/') ? WS_URL : `/ws/metrics`;
  return `${protocol}//${host}${path}`;
};
