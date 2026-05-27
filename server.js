import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const PORT = process.env.PORT || 9000;
const GAME_JAR = path.join(__dirname, 'public/games/KuenosGame.jar');

// Map pour stocker les processus Java actifs
const activeGames = new Map();

// Créer le serveur HTTP
const server = createServer((req, res) => {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route pour lancer le jeu
  if (req.method === 'POST' && req.url === '/api/game/launch') {
    const gameId = generateGameId();
    const gameProcess = launchGame(gameId);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      gameId,
      message: 'Jeu lancé avec succès'
    }));
    return;
  }

  // Route pour arrêter le jeu
  if (req.method === 'POST' && req.url.startsWith('/api/game/stop/')) {
    const gameId = req.url.split('/').pop();
    stopGame(gameId);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true, 
      message: 'Jeu arrêté'
    }));
    return;
  }

  // Route pour obtenir le statut
  if (req.method === 'GET' && req.url === '/api/game/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      activeGames: activeGames.size,
      games: Array.from(activeGames.keys())
    }));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

// Créer le serveur WebSocket
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client WebSocket connecté');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data);
    } catch (error) {
      console.error('Erreur parsing WebSocket:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Erreur parsing du message'
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client WebSocket déconnecté');
  });

  ws.on('error', (error) => {
    console.error('Erreur WebSocket:', error);
  });
});

// Fonctions utilitaires
function generateGameId() {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function launchGame(gameId) {
  try {
    console.log(`Lancement du jeu ${gameId}...`);

    // Arguments Java
    const javaArgs = ['-XstartOnFirstThread', '-jar', GAME_JAR];

    const javaProcess = spawn('java', javaArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false,
    });

    // Stocker le processus
    activeGames.set(gameId, {
      process: javaProcess,
      startTime: new Date(),
      output: [],
      status: 'running'
    });

    // Écouter stdout
    javaProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[${gameId}] Java stdout:`, output);

      const game = activeGames.get(gameId);
      if (game) {
        game.output.push(output);
        // Garder que les 100 dernières lignes
        if (game.output.length > 100) {
          game.output.shift();
        }
      }

      // Broadcast à tous les clients WebSocket connectés
      broadcastToClients({
        type: 'game_output',
        gameId,
        output,
        timestamp: new Date().toISOString()
      });
    });

    // Écouter stderr
    javaProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(`[${gameId}] Java stderr:`, error);

      broadcastToClients({
        type: 'game_error',
        gameId,
        error,
        timestamp: new Date().toISOString()
      });
    });

    // Gérer la fermeture du processus
    javaProcess.on('close', (code) => {
      console.log(`[${gameId}] Processus Java fermé avec code ${code}`);
      const game = activeGames.get(gameId);
      if (game) {
        game.status = 'closed';
        game.exitCode = code;
      }

      broadcastToClients({
        type: 'game_closed',
        gameId,
        exitCode: code,
        timestamp: new Date().toISOString()
      });
    });

    // Gérer les erreurs de lancement
    javaProcess.on('error', (error) => {
      console.error(`[${gameId}] Erreur processus:`, error);
      activeGames.delete(gameId);

      broadcastToClients({
        type: 'game_error',
        gameId,
        error: error.message,
        fatal: true,
        timestamp: new Date().toISOString()
      });
    });

    return javaProcess;
  } catch (error) {
    console.error('Erreur lancement jeu:', error);
    activeGames.delete(gameId);
    throw error;
  }
}

function stopGame(gameId) {
  const game = activeGames.get(gameId);
  if (!game) {
    console.warn(`Jeu ${gameId} introuvable`);
    return false;
  }

  try {
    // Tuer le processus
    if (game.process && !game.process.killed) {
      process.kill(-game.process.pid); // Le - tue tout le groupe de processus
    }
    game.status = 'stopped';
    console.log(`Jeu ${gameId} arrêté`);
    return true;
  } catch (error) {
    console.error(`Erreur arrêt jeu ${gameId}:`, error);
    return false;
  }
}

function broadcastToClients(message) {
  const messageStr = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(messageStr);
    }
  });
}

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`\n🎮 Serveur de jeu démarré sur http://localhost:${PORT}`);
  console.log(`📡 WebSocket disponible sur ws://localhost:${PORT}`);
  console.log(`📦 JAR utilisé: ${GAME_JAR}\n`);
});

// Gestion de l'arrêt gracieux
process.on('SIGINT', () => {
  console.log('\n⏹️  Arrêt du serveur...');
  
  // Arrêter tous les jeux actifs
  activeGames.forEach((game, gameId) => {
    stopGame(gameId);
  });

  server.close(() => {
    console.log('Serveur arrêté');
    process.exit(0);
  });
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('Erreur non capturée:', error);
});
