import { ref, onUnmounted } from 'vue';

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

export function useGameServer(serverUrl: string = 'ws://localhost:9000') {
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const gameStatus = ref<GameStatus>({
    running: false,
    gameId: null,
    output: [],
    errors: [],
    status: 'idle'
  });

  /**
   * Connecter au serveur WebSocket
   */
  function connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`🔌 Tentative de connexion à ${serverUrl}...`);
        ws.value = new WebSocket(serverUrl);

        ws.value.onopen = () => {
          console.log('✅ Connecté au serveur WebSocket');
          isConnected.value = true;
          gameStatus.value.status = 'idle';
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
          console.error('❌ Erreur WebSocket:', event);
          console.error('État de la connexion:', ws.value?.readyState);
          isConnected.value = false;
          gameStatus.value.status = 'error';
          // Ne pas rejeter immédiatement, laisser onclose s'en charger
        };

        ws.value.onclose = () => {
          console.log('🔌 Déconnecté du serveur WebSocket');
          isConnected.value = false;
          gameStatus.value.running = false;
          if (!ws.value?.readyState || ws.value.readyState === WebSocket.CLOSED) {
            reject(new Error('Impossible de se connecter au serveur WebSocket'));
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
   * Lancer le jeu
   */
  async function launchGame(): Promise<string | null> {
    try {
      if (!isConnected.value) {
        throw new Error('Non connecté au serveur');
      }

      gameStatus.value.status = 'launching';
      gameStatus.value.output = [];
      gameStatus.value.errors = [];

      const response = await fetch('http://localhost:9000/api/game/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
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
    } catch (error) {
      gameStatus.value.status = 'error';
      gameStatus.value.running = false;
      console.error('Erreur lancement jeu:', error);
      throw error;
    }
  }

  /**
   * Arrêter le jeu
   */
  async function stopGame(): Promise<void> {
    try {
      if (!gameStatus.value.gameId) {
        throw new Error('Aucun jeu en cours');
      }

      gameStatus.value.status = 'launching';

      const response = await fetch(
        `http://localhost:9000/api/game/stop/${gameStatus.value.gameId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      gameStatus.value.gameId = null;
      gameStatus.value.running = false;
      gameStatus.value.status = 'idle';
      console.log('🛑 Jeu arrêté');
    } catch (error) {
      gameStatus.value.status = 'error';
      console.error('Erreur arrêt jeu:', error);
      throw error;
    }
  }

  /**
   * Obtenir le statut des jeux actifs
   */
  async function getGameStatus() {
    try {
      const response = await fetch('http://localhost:9000/api/game/status');
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log('📊 Statut des jeux:', data);
      return data;
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
