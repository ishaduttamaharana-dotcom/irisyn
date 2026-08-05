export const getWebSocketUrl = (): string => {
  const envUrl = import.meta.env.VITE_WS_URL;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

  if (envUrl && (envUrl.startsWith('ws://') || envUrl.startsWith('wss://'))) {
    // If running on HTTPS domain, convert localhost to secure wss on current host
    if (window.location.protocol === 'https:' && envUrl.includes('localhost')) {
      return `wss://${window.location.host}/ws`;
    }
    return envUrl;
  }

  const path = envUrl && envUrl.startsWith('/') ? envUrl : '/ws';
  return `${protocol}//${window.location.host}${path}`;
};
