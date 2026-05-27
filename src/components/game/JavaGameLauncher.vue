<template>
  <div class="relative h-full w-full bg-black">
    <!-- Loading state -->
    <div v-if="gameStatus.status === 'launching'" class="absolute inset-0 flex items-center justify-center z-50">
      <div class="bg-black/80 backdrop-blur-sm rounded-lg p-8 text-center">
        <div class="mb-4 flex justify-center">
          <div class="animate-spin">
            <svg class="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" class="opacity-25"></circle>
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            </svg>
          </div>
        </div>
        <p class="text-white font-semibold mb-2">Lancement du jeu...</p>
        <p class="text-slate-400 text-sm">Veuillez patienter</p>
      </div>
    </div>

    <!-- Game view -->
    <div v-else-if="gameStatus.status === 'running'" class="h-full w-full flex flex-col">
      <!-- Header avec contrôles -->
      <div class="bg-gradient-to-b from-black/80 to-transparent p-4 z-10 border-b border-white/10">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-white font-semibold text-sm">Jeu en cours</span>
          </div>
          <button
            @click="handleStopGame"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
          >
            ⏹️ Quitter
          </button>
        </div>
      </div>

      <!-- Game output area -->
      <div class="flex-1 overflow-hidden bg-black">
        <div
          v-if="gameStatus.output.length === 0"
          class="h-full flex items-center justify-center text-slate-500"
        >
          <div class="text-center">
            <p class="mb-2">🎮 Jeu lancé</p>
            <p class="text-sm">En attente du rendu du jeu...</p>
          </div>
        </div>
        <div
          v-else
          class="h-full p-4 font-mono text-xs text-slate-300 overflow-y-auto bg-slate-950"
        >
          <div v-for="(line, idx) in gameStatus.output" :key="idx" class="whitespace-pre-wrap">
            {{ line }}
          </div>
        </div>
      </div>

      <!-- Footer avec informations -->
      <div class="bg-gradient-to-t from-black/80 to-transparent p-4 text-xs text-slate-400 border-t border-white/10">
        <p>ID: <span class="text-slate-300">{{ gameStatus.gameId }}</span></p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="gameStatus.status === 'error'" class="absolute inset-0 flex items-center justify-center z-50">
      <div class="bg-red-950/80 backdrop-blur-sm rounded-lg p-8 text-center max-w-md">
        <div class="mb-4 text-4xl">⚠️</div>
        <p class="text-white font-semibold mb-4">Erreur au lancement du jeu</p>
        <p class="text-red-200 text-sm mb-6">{{ errorMessage }}</p>
        <button
          @click="handleRetry"
          class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          🔄 Réessayer
        </button>
      </div>
    </div>

    <!-- Stopped state -->
    <div v-else-if="gameStatus.status === 'stopped'" class="absolute inset-0 flex items-center justify-center z-50">
      <div class="bg-slate-900/80 backdrop-blur-sm rounded-lg p-8 text-center">
        <div class="mb-4 text-4xl">🛑</div>
        <p class="text-white font-semibold mb-2">Jeu fermé</p>
        <p class="text-slate-400 text-sm mb-6">Le jeu s'est terminé avec le code {{ exitCode }}</p>
        <button
          @click="handleRetry"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          🔄 Relancer
        </button>
      </div>
    </div>

    <!-- Idle/ready state -->
    <div v-else class="h-full flex items-center justify-center">
      <button
        @click="handleLaunchGame"
        class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 active:scale-95"
      >
        ▶️ Lancer le jeu
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useGameServer } from '@/composables/useGameServer';

const emit = defineEmits<{
  closed: [];
}>();

const { gameStatus, isConnected, connect, launchGame, stopGame } = useGameServer();
const exitCode = ref<number | null>(null);

const errorMessage = computed(() => {
  if (gameStatus.value.errors.length > 0) {
    return gameStatus.value.errors[gameStatus.value.errors.length - 1];
  }
  return 'Une erreur inconnue s\'est produite';
});

/**
 * Lancer le jeu
 */
async function handleLaunchGame() {
  try {
    await launchGame();
  } catch (error) {
    console.error('Erreur lancement:', error);
  }
}

/**
 * Arrêter le jeu
 */
async function handleStopGame() {
  try {
    await stopGame();
    emit('closed');
  } catch (error) {
    console.error('Erreur arrêt:', error);
  }
}

/**
 * Réessayer
 */
async function handleRetry() {
  gameStatus.value.status = 'idle';
  gameStatus.value.output = [];
  gameStatus.value.errors = [];
  exitCode.value = null;
}

/**
 * Initialiser la connexion au serveur
 */
onMounted(async () => {
  if (!isConnected.value) {
    try {
      await connect();
    } catch (error) {
      console.error('Erreur connexion WebSocket:', error);
      gameStatus.value.status = 'error';
    }
  }
});

// Écouter les changements de statut pour le code de sortie
import { watch } from 'vue';
watch(() => gameStatus.value.status, (newStatus) => {
  if (newStatus === 'stopped') {
    // On peut accéder au code de sortie via le dernier message reçu
    // Pour l'instant, on le laisse null
  }
});
</script>

<style scoped>
/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
