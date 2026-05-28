<template>
  <div class="relative h-full w-full overflow-hidden bg-void">
    <!-- Animated background elements -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute top-0 left-1/4 h-96 w-96 bg-glow/10 rounded-full mix-blend-screen filter blur-3xl opacity-20" />
      <div class="absolute bottom-0 right-1/4 h-80 w-80 bg-gold/5 rounded-full mix-blend-screen filter blur-3xl opacity-15" />
    </div>

    <!-- Loading state -->
    <transition name="fade-scale">
      <div v-if="gameStatus.status === 'launching'" class="absolute inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
        <div class="relative border border-glow/30 bg-slate-950/60 shadow-[0_0_40px_rgba(245,158,11,0.15)] backdrop-blur-xl rounded-3xl p-12 text-center max-w-sm">
          <div class="mb-6 flex justify-center">
            <div class="relative h-16 w-16">
              <div class="absolute inset-0 animate-spin rounded-full border-2 border-glow/20 border-t-glow" />
              <div class="absolute inset-2 flex items-center justify-center text-2xl">⚡</div>
            </div>
          </div>
          <p class="text-white font-bold text-lg mb-2 tracking-wide">Lancement du jeu</p>
          <p class="text-white/60 text-sm leading-relaxed">Initialisation en cours...</p>
        </div>
      </div>
    </transition>

    <!-- Game view -->
    <transition name="fade">
      <div v-if="gameStatus.status === 'running'" class="h-full w-full flex flex-col">
        <!-- Header avec contrôles -->
        <div class="relative z-10 border-b border-glow/20 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent px-6 py-4 backdrop-blur-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="relative h-3 w-3 rounded-full bg-glow shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-pulse" />
              <span class="text-white/90 font-semibold text-sm uppercase tracking-wide">Jeu en cours d'exécution</span>
            </div>
            <button
              @click="handleStopGame"
              class="group relative overflow-hidden rounded-xl border border-red-500/30 bg-red-950/20 px-5 py-2.5 text-sm font-bold text-red-300 shadow-[0_8px_24px_rgba(220,38,38,0.15)] transition-all duration-300 hover:border-red-500/60 hover:bg-red-900/30 hover:shadow-[0_12px_32px_rgba(220,38,38,0.25)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-void"
              aria-label="Arrêter le jeu"
            >
              <span class="relative flex items-center justify-center gap-2">
                <span>⏹</span>
                <span>Quitter</span>
              </span>
            </button>
          </div>
        </div>

        <!-- Game output area -->
        <div class="flex-1 overflow-hidden bg-slate-950/30 relative">
          <div
            v-if="gameStatus.output.length === 0"
            class="h-full flex flex-col items-center justify-center text-white/50"
          >
            <div class="text-center">
              <p class="mb-4 text-5xl">🎮</p>
              <p class="mb-2 text-lg font-semibold text-white/70">Jeu lancé avec succès</p>
              <p class="text-sm leading-relaxed text-white/50">En attente du rendu du jeu...</p>
            </div>
          </div>
          <div
            v-else
            class="h-full p-6 font-mono text-xs text-white/70 overflow-y-auto scroll-smooth bg-slate-950/20 space-y-1"
          >
            <div v-for="(line, idx) in gameStatus.output" :key="idx" class="whitespace-pre-wrap text-white/60 hover:text-white/80 transition-colors">
              {{ line }}
            </div>
          </div>
        </div>

        <!-- Footer avec informations -->
        <div class="relative z-10 border-t border-glow/20 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent px-6 py-3 text-xs text-white/50 backdrop-blur-sm">
          <p class="flex items-center justify-between">
            <span>ID du jeu: <span class="text-white/70 font-mono">{{ gameStatus.gameId }}</span></span>
            <span class="text-glow/70">▲</span>
          </p>
        </div>
      </div>
    </transition>

    <!-- Error state -->
    <transition name="fade-scale">
      <div v-if="gameStatus.status === 'error'" class="absolute inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm p-4">
        <div class="relative border border-red-500/40 bg-slate-950/80 shadow-[0_0_60px_rgba(220,38,38,0.2)] backdrop-blur-xl rounded-3xl p-10 text-center max-w-md">
          <div class="absolute -top-1 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          <p class="mb-6 text-5xl">⚠️</p>
          <p class="mb-3 text-white font-bold text-lg uppercase tracking-wide">Erreur au lancement</p>
          <p class="mb-8 text-red-200/80 text-sm leading-relaxed">{{ errorMessage }}</p>
          <button
            @click="handleRetry"
            class="group relative overflow-hidden rounded-xl border border-glow/40 bg-glow/10 px-8 py-3 text-sm font-bold text-glow shadow-[0_8px_24px_rgba(245,158,11,0.15)] transition-all duration-300 hover:border-glow/70 hover:bg-glow/20 hover:shadow-[0_12px_32px_rgba(245,158,11,0.3)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-glow/50 focus:ring-offset-2 focus:ring-offset-void uppercase tracking-wide"
          >
            <span class="relative flex items-center justify-center gap-2">
              <span>🔄</span>
              <span>Réessayer</span>
            </span>
          </button>
        </div>
      </div>
    </transition>

    <!-- Stopped state -->
    <transition name="fade-scale">
      <div v-if="gameStatus.status === 'stopped'" class="absolute inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm p-4">
        <div class="relative border border-glow/30 bg-slate-950/80 shadow-[0_0_50px_rgba(245,158,11,0.1)] backdrop-blur-xl rounded-3xl p-10 text-center max-w-md">
          <p class="mb-6 text-5xl">✓</p>
          <p class="mb-3 text-white font-bold text-lg uppercase tracking-wide">Jeu fermé</p>
          <p class="mb-8 text-white/60 text-sm leading-relaxed">Le jeu s'est terminé avec le code <span class="font-mono text-glow/80">{{ exitCode }}</span></p>
          <div class="flex gap-4 flex-col sm:flex-row justify-center">
            <button
              @click="handleRetry"
              class="group relative overflow-hidden rounded-xl border border-glow/40 bg-glow/10 px-8 py-3 text-sm font-bold text-glow shadow-[0_8px_24px_rgba(245,158,11,0.15)] transition-all duration-300 hover:border-glow/70 hover:bg-glow/20 hover:shadow-[0_12px_32px_rgba(245,158,11,0.3)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-glow/50 focus:ring-offset-2 focus:ring-offset-void uppercase tracking-wide"
            >
              <span class="relative flex items-center justify-center gap-2">
                <span>🔄</span>
                <span>Relancer</span>
              </span>
            </button>
            <button
              @click="handleClose"
              class="group relative overflow-hidden rounded-xl border border-white/30 bg-white/5 px-8 py-3 text-sm font-bold text-white/70 shadow-[0_8px_24px_rgba(255,255,255,0.08)] transition-all duration-300 hover:border-white/50 hover:bg-white/10 hover:text-white hover:shadow-[0_12px_32px_rgba(255,255,255,0.15)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-void uppercase tracking-wide"
            >
              <span class="relative flex items-center justify-center gap-2">
                <span>✕</span>
                <span>Fermer</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Idle/ready state -->
    <transition name="fade">
      <div v-if="gameStatus.status === 'idle'" class="h-full flex items-center justify-center relative z-10">
        <div class="text-center">
          <div class="mb-8 text-7xl">🎮</div>
          <p class="mb-8 text-white/80 text-lg max-w-sm leading-relaxed">Prêt à lancer le jeu Java. Cliquez pour commencer votre aventure.</p>
          <button
            @click="handleLaunchGame"
            class="group relative overflow-hidden rounded-2xl border border-glow/40 bg-gradient-to-r from-glow/20 to-gold/10 px-10 py-5 text-base font-bold text-glow shadow-[0_12px_40px_rgba(245,158,11,0.2)] transition-all duration-300 hover:border-glow/70 hover:from-glow/30 hover:to-gold/20 hover:shadow-[0_16px_50px_rgba(245,158,11,0.35)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-glow/50 focus:ring-offset-2 focus:ring-offset-void uppercase tracking-wide"
            aria-label="Lancer le jeu"
          >
            <span class="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span class="relative flex items-center justify-center gap-3">
              <span class="text-lg">▶</span>
              <span>Lancer le jeu</span>
            </span>
          </button>
        </div>
      </div>
    </transition>
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
 * Fermer le launcher et retourner au menu
 */
function handleClose() {
  // Reset game status before closing
  gameStatus.value.status = 'idle';
  gameStatus.value.output = [];
  gameStatus.value.errors = [];
  exitCode.value = null;
  // Emit closed event to parent (GameTitleScreen)
  emit('closed');
}

/**
 * Initialiser la connexion au serveur et lancer automatiquement le jeu
 */
onMounted(async () => {
  if (!isConnected.value) {
    try {
      await connect();
      // Auto-launch game immediately after connection
      await launchGame();
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

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

/* Smooth scrolling for console output */
.scroll-smooth {
  scroll-behavior: smooth;
}
</style>
