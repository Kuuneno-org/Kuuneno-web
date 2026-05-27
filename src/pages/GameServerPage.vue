<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">🎮 Gestionnaire de Jeu Java</h1>
        <p class="text-slate-400">Lancez et gérez votre jeu Java via WebSocket</p>
      </div>

      <!-- Statut de connexion -->
      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-3 h-3 rounded-full transition-colors"
              :class="isConnected ? 'bg-green-500' : 'bg-red-500'"
            />
            <span class="text-white font-semibold">
              {{ isConnected ? '✅ Connecté' : '❌ Déconnecté' }}
            </span>
          </div>
          <div class="text-sm text-slate-400">
            Statut: <span class="text-blue-400 font-mono">{{ gameStatus.status }}</span>
          </div>
        </div>
      </div>

      <!-- Contrôles principaux -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          @click="handleConnect"
          :disabled="isConnected"
          class="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          🔌 Connecter
        </button>

        <button
          @click="handleLaunchGame"
          :disabled="!isConnected || gameStatus.running"
          class="bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {{ gameStatus.running ? '🎮 Jeu en cours...' : '▶️ Lancer le jeu' }}
        </button>

        <button
          @click="handleStopGame"
          :disabled="!gameStatus.running"
          class="bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          ⏹️ Arrêter le jeu
        </button>

        <button
          @click="handleGetStatus"
          :disabled="!isConnected"
          class="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          📊 Obtenir le statut
        </button>
      </div>

      <!-- Informations du jeu -->
      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700" v-if="gameStatus.gameId">
        <h3 class="text-white font-semibold mb-3">📍 Informations du jeu</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span class="text-slate-400">ID du jeu:</span>
            <p class="text-blue-400 font-mono break-all">{{ gameStatus.gameId }}</p>
          </div>
          <div>
            <span class="text-slate-400">Statut:</span>
            <p class="text-yellow-400 font-mono">{{ gameStatus.status }}</p>
          </div>
        </div>
      </div>

      <!-- Output du jeu -->
      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-white font-semibold mb-3">📤 Output du jeu</h3>
        <div
          class="bg-slate-900 rounded p-3 h-48 overflow-y-auto font-mono text-xs text-slate-300 border border-slate-700"
        >
          <div v-if="gameStatus.output.length === 0" class="text-slate-500">
            En attente d'output du jeu...
          </div>
          <div v-for="(line, index) in gameStatus.output" :key="index" class="whitespace-pre-wrap">
            {{ line }}
          </div>
        </div>
      </div>

      <!-- Erreurs -->
      <div v-if="gameStatus.errors.length > 0" class="bg-slate-800 rounded-lg p-4 border border-red-700">
        <h3 class="text-red-400 font-semibold mb-3">⚠️ Erreurs</h3>
        <div
          class="bg-slate-900 rounded p-3 h-32 overflow-y-auto font-mono text-xs text-red-300 border border-red-700"
        >
          <div v-for="(error, index) in gameStatus.errors" :key="index" class="whitespace-pre-wrap">
            {{ error }}
          </div>
        </div>
      </div>

      <!-- Messages de débogage -->
      <div class="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 class="text-white font-semibold mb-3">🐛 Débogage</h3>
        <div class="space-y-2 text-sm text-slate-400">
          <p><span class="text-slate-300">Serveur:</span> ws://localhost:9000</p>
          <p><span class="text-slate-300">JAR:</span> public/games/KuenosGame.jar</p>
          <p><span class="text-slate-300">Jeux actifs:</span> {{ activeGameCount }}</p>
          <p><span class="text-slate-300">Dernière mise à jour:</span> {{ lastUpdate }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameServer } from '@/composables/useGameServer';

const { gameStatus, isConnected, connect, launchGame, stopGame, getGameStatus } = useGameServer();

const activeGameCount = ref(0);
const lastUpdate = ref(new Date().toLocaleTimeString());

/**
 * Connecter au serveur
 */
async function handleConnect() {
  try {
    await connect();
    lastUpdate.value = new Date().toLocaleTimeString();
  } catch (error) {
    console.error('Erreur connexion:', error);
    alert('Impossible de se connecter au serveur. Assurez-vous que le serveur est lancé.');
  }
}

/**
 * Lancer le jeu
 */
async function handleLaunchGame() {
  try {
    await launchGame();
    lastUpdate.value = new Date().toLocaleTimeString();
  } catch (error) {
    console.error('Erreur lancement:', error);
    alert('Erreur lors du lancement du jeu');
  }
}

/**
 * Arrêter le jeu
 */
async function handleStopGame() {
  try {
    await stopGame();
    lastUpdate.value = new Date().toLocaleTimeString();
  } catch (error) {
    console.error('Erreur arrêt:', error);
    alert('Erreur lors de l\'arrêt\' du jeu');
  }
}

/**
 * Obtenir le statut
 */
async function handleGetStatus() {
  try {
    const status = await getGameStatus();
    activeGameCount.value = status.activeGames;
    lastUpdate.value = new Date().toLocaleTimeString();
  } catch (error) {
    console.error('Erreur statut:', error);
    alert('Erreur lors de la récupération du statut');
  }
}

/**
 * Connexion automatique au montage
 */
onMounted(() => {
  handleConnect();
});
</script>
