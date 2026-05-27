/**
 * Configuration centralisée pour les URLs API et WebSocket
 * Peuvent être surchargées via des variables d'environnement
 */

const isDev = import.meta.env.DEV;

interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  websocket: {
    url: string;
    reconnectAttempts: number;
    reconnectDelay: number; // ms entre les tentatives
    connectionTimeout: number; // ms avant timeout initial
  };
  cache: {
    modelsTTL: number; // ms avant expiration du cache GLTF
    maxModels: number; // nombre max de modèles en cache
  };
}

export const appConfig: AppConfig = {
  api: {
    baseUrl:
      import.meta.env.VITE_API_BASE_URL || (isDev ? 'http://localhost:9000' : '/api'),
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
  },
  websocket: {
    url:
      import.meta.env.VITE_WS_URL || (isDev ? 'ws://localhost:9000' : 'ws://localhost:9000'),
    reconnectAttempts: parseInt(import.meta.env.VITE_WS_RECONNECT_ATTEMPTS || '5', 10),
    reconnectDelay: parseInt(import.meta.env.VITE_WS_RECONNECT_DELAY || '2000', 10),
    connectionTimeout: parseInt(import.meta.env.VITE_WS_TIMEOUT || '5000', 10),
  },
  cache: {
    modelsTTL: parseInt(import.meta.env.VITE_CACHE_MODELS_TTL || '3600000', 10), // 1h par défaut
    maxModels: parseInt(import.meta.env.VITE_CACHE_MAX_MODELS || '50', 10),
  },
};

/**
 * Retourne l'URL API complète
 */
export function getApiUrl(path: string): string {
  const baseUrl = appConfig.api.baseUrl.replace(/\/$/, ''); // enlever / final
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Retourne l'URL WebSocket
 */
export function getWebSocketUrl(): string {
  return appConfig.websocket.url;
}
