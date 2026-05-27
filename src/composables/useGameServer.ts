import { ref, onUnmounted } from 'vue';
import { getApiUrl, getWebSocketUrl, appConfig } from '@/config/env';

interface GameMessage {
  type: 'game_output' | 'game_error' | 'game_closed' | 'error';
  gameId?: string;
  output?: string;
  error?: string;
  exitCode?: number;
  fatal?: boolean;
  timestamp?: string;
  message?: string;
}

interface GameStatus {
  running: boolean;
  gameId: string | null;
  output: string[];
  errors: string[];
  status: 'idle' | 'launching' | 'running' | 'stopped' | 'error';
}

export function useGameServer(serverUrl?: string) {
  // Utiliser l'URL fournie ou celle de la config
  const wsUrl = serverUrl || getWebSocketUrl();
  
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const reconnectAttempts = ref(0);
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  
  const gameStatus = ref<GameStatus>({
    running: false,
    gameId: null,
    output: [],
    errors: [],
    status: 'idle'
  });

  /**
   * Connecter au serveur WebSocket avec reconnexion automatique
   */
  function connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`🔌 Tentative de connexion à ${wsUrl}...`);
        ws.value = new WebSocket(wsUrl);
        
        // Timeout pour la connexion initiale
        const connectionTimeout = setTimeout(() => {
          if (ws.value?.readyState === WebSocket.CONNECTING) {
            ws.value?.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, appConfig.websocket.connectionTimeout);

        ws.value.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('✅ Connecté au serveur WebSocket');
          isConnected.value = true;
          gameStatus.value.status = 'idle';
          reconnectAttempts.value = 0; // Reset reconnect counter
          resolve();
        };

        ws.value.onmessage = (event) => {
          try {
            const message: GameMessage = JSON.parse(event.data);
            handleMessage(message);
          } catch (error) {
            console.error('Erreur parsing message WebSocket:', error);
          }
        };

        ws.value.onerror = (event) => {
          clearTimeout(connectionTimeout);
          console.error('❌ Erreur WebSocket:', event);
          isConnected.value = false;
          gameStatus.value.status = 'error';
        };

        ws.value.onclose = () => {
          clearTimeout(connectionTimeout);
          console.log('🔌 Déconnecté du serveur WebSocket');
          isConnected.value = false;
          gameStatus.value.running = false;
          
          // Tentatives de reconnexion
          if (reconnectAttempts.value < appConfig.websocket.reconnectAttempts) {
            reconnectAttempts.value++;
            const delay = appConfig.websocket.reconnectDelay * reconnectAttempts.value;
            console.log(`⏳ Tentative de reconnexion #${reconnectAttempts.value} dans ${delay}ms...`);
            reconnectTimeout = setTimeout(() => {
              connect().catch(console.error);
            }, delay);
          } else {
            reject(new Error('Max reconnection attempts reached'));
          }
        };
      } catch (error) {
        console.error('Erreur connexion WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Gérer les messages reçus du serveur
   */
  function handleMessage(message: GameMessage) {
    switch (message.type) {
      case 'game_output':
        if (message.output) {
          gameStatus.value.output.push(message.output);
          // Garder que les 50 dernières lignes
          if (gameStatus.value.output.length > 50) {
            gameStatus.value.output.shift();
          }
        }
        console.log(`📤 Output: ${message.output}`);
        break;

      case 'game_error':
        if (message.error) {
          gameStatus.value.errors.push(message.error);
          if (gameStatus.value.errors.length > 30) {
            gameStatus.value.errors.shift();
          }
        }
        if (message.fatal) {
          gameStatus.value.status = 'error';
          gameStatus.value.running = false;
        }
        console.error(`⚠️ Error: ${message.error}`);
        break;

      case 'game_closed':
        gameStatus.value.running = false;
        gameStatus.value.status = 'stopped';
        console.log(`🛑 Jeu fermé avec le code ${message.exitCode}`);
        break;

      case 'error':
        console.error(`❌ Erreur serveur: ${message.message}`);
        gameStatus.value.status = 'error';
        break;
    }
  }

  /**
   * Lancer le jeu avec timeout
   */
  async function launchGame(): Promise<string | null> {
    try {
      if (!isConnected.value) {
        throw new Error('Non connecté au serveur');
      }

      gameStatus.value.status = 'launching';
      gameStatus.value.output = [];
      gameStatus.value.errors = [];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), appConfig.api.timeout);

      try {
        const response = await fetch(getApiUrl('/api/game/launch'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          gameStatus.value.gameId = data.gameId;
          gameStatus.value.running = true;
          gameStatus.value.status = 'running';
          console.log(`🎮 Jeu lancé avec l'ID: ${data.gameId}`);
          return data.gameId;
        } else {
          throw new Error(data.message || 'Erreur inconnue');
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      gameStatus.value.status = 'error';
      gameStatus.value.running = false;
      console.error('Erreur lancement jeu:', error);
      throw error;
    }
  }

  /**
   * Arrêter le jeu avec timeout
   */
  async function stopGame(): Promise<void> {
    try {
      if (!gameStatus.value.gameId) {
        throw new Error('Aucun jeu en cours');
      }

      gameStatus.value.status = 'launching';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), appConfig.api.timeout);

      try {
        const response = await fetch(
          getApiUrl(`/api/game/stop/${gameStatus.value.gameId}`),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        gameStatus.value.gameId = null;
        gameStatus.value.running = false;
        gameStatus.value.status = 'idle';
        console.log('🛑 Jeu arrêté');
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      gameStatus.value.status = 'error';
      console.error('Erreur arrêt jeu:', error);
      throw error;
    }
  }

  /**
   * Obtenir le statut des jeux actifs avec timeout
   */
  async function getGameStatus() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), appConfig.api.timeout);

      try {
        const response = await fetch(getApiUrl('/api/game/status'), {
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        console.log('📊 Statut des jeux:', data);
        return data;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Erreur récupération statut:', error);
      throw error;
    }
  }

  /**
   * Déconnecter du serveur
   */
  function disconnect(): void {
    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }
    isConnected.value = false;
  }

  /**
   * Nettoyer à la destruction du composant
   */
  onUnmounted(() => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    if (gameStatus.value.running) {
      stopGame().catch(console.error);
    }
    disconnect();
  });

  return {
    // État
    gameStatus,
    isConnected,
    
    // Méthodes
    connect,
    disconnect,
    launchGame,
    stopGame,
    getGameStatus
  };
}
