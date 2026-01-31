<template>
  <section class="home">
    <StartScreen
      v-if="!isGameStarted"
      @start="onStartGame"
      @login-facebook="onLoginFacebook"
      @help="onHelp"
    />

    <div class="hud" v-show="isGameStarted">
      <div class="hud-card">
        <h1>Bienvenue sur Kuuneno</h1>
        <p>Choisissez un objet autour du feu.</p>
      </div>
    </div>

    <div class="top-controls">
      <button class="btn-menu" type="button" @click="returnToHome" aria-label="Retour au menu" v-if="isGameStarted">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Menu</span>
      </button>
    </div>

    <div class="stage">
      <HomeScene
        :active-index="controls.activeIndex"
        :is-game-started="isGameStarted"
        @select-index="onSelectIndex"
        @navigate="onNavigate"
        @scene-entered="onSceneEntered"
      />
    </div>

    <!-- Navigation Detached UI -->
    <div class="nav-ui" v-show="isGameStarted">
      <div class="nav-controls">
        <button class="nav-btn nav-arrow" type="button" @click="prev" aria-label="Précédent">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-icon lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </button>
        
        <button class="nav-btn nav-recenter" type="button" @click="recenter" aria-label="Recentrer" :disabled="controls.activeIndex === -1">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          <span>Recentrer</span>
        </button>

        <button class="nav-btn nav-arrow" type="button" @click="next" aria-label="Suivant">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right-icon lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>

        <button class="nav-btn nav-arrow btn-sound" type="button" @click="toggleBgMusic" aria-label="Mute/Unmute">
          <svg v-if="!isBgMusicPlaying" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-off-icon lucide-volume-off"><path d="M16 9a5 5 0 0 1 .95 2.293"/><path d="M19.364 5.636a9 9 0 0 1 1.889 9.96"/><path d="m2 2 20 20"/><path d="m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11"/><path d="M9.828 4.172A.686.686 0 0 1 11 4.657v.686"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-icon lucide-volume"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/></svg>
        </button>
      </div>
    </div>

    <!-- Object Info Panel -->
    <transition name="slide-up">
      <div class="object-info-panel" v-if="isGameStarted && controls.activeIndex !== -1">
        <div class="panel-glass">
          <div class="panel-header">
            <h2>{{ controls.activeItem.label }}</h2>
            <button class="btn-close" @click="recenter" aria-label="Fermer">×</button>
          </div>
          <p class="panel-desc">{{ currentDescription }}</p>
          <button class="btn-access" @click="accessItem">
            <span>Accéder</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- Tutorial Modal -->
    <transition name="fade">
      <div class="tutorial-modal-overlay" v-if="showTutorialModal" @click.self="closeTutorialModal">
        <div class="tutorial-modal-content">
          <img :src="browseArrowsUrl" alt="Navigation Tutorial" class="tutorial-img" />
          <p class="tutorial-text">Utilisez les flèches directionnelles situées en bas à gauche de l'écran pour naviguer entre les objets.</p>
          <button class="btn-tutorial-close" @click="closeTutorialModal">C'est parti !</button>
        </div>
      </div>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { computed } from "vue";
import { useRouter } from "vue-router";
import HomeScene from "@/components/home/HomeScene.vue";
import StartScreen from "@/components/ui/StartScreen.vue";
import { useHomeControls } from "@/stores/homeControls";
import { useAudio } from "@/composables/useAudio";
import bgMusicUrl from "@/assets/musics/survival-music.mp3";
import browseArrowsUrl from "@/assets/browse_arrows.png";

const router = useRouter();
const controls = useHomeControls();
const isGameStarted = ref(false);
const showTutorialModal = ref(false);

const itemDescriptions: Record<string, string> = {
  "mask": "Plongez dans les mystères de la tribu Kuuneno à travers une expérience narrative unique.",
  "altar": "Découvrez les créateurs et les esprits derrière ce projet mystique.",
  "book": "Explorez les légendes et les récits anciens qui ont façonné ce monde.",
  "gamepad": "Testez vos réflexes dans ce défi ancestral."
};

const currentDescription = computed(() => {
  if (controls.activeIndex === -1) return "";
  const item = controls.activeItem;
  if ('kind' in item && item.kind) {
    return itemDescriptions[item.kind] || "";
  }
  return "";
});

function accessItem() {
  if (controls.activeItem && 'route' in controls.activeItem && controls.activeItem.route) {
    router.push(controls.activeItem.route);
  }
}

// Musique de fond
const { play: playBgMusic, pause: pauseBgMusic, isPlaying: isBgMusicPlaying } = useAudio(bgMusicUrl, { volume: 0.15, loop: true });

function toggleBgMusic() {
  if (isBgMusicPlaying.value) {
    pauseBgMusic();
  } else {
    playBgMusic();
  }
}

function onStartGame() {
  isGameStarted.value = true;
  // Essayer de lancer la musique lors de l'interaction utilisateur explicite
  if (!isBgMusicPlaying.value) {
    playBgMusic().catch(() => {});
  }
}

function onSceneEntered() {
  showTutorialModal.value = true;
}

function returnToHome() {
  isGameStarted.value = false;
  controls.setIndex(-1);
  showTutorialModal.value = false;
}

function closeTutorialModal() {
  showTutorialModal.value = false;
}

function onLoginFacebook() {
  console.log("Login Facebook");
  // Logique de connexion future
}

function onHelp() {
  console.log("Aide demandée");
  // Afficher modal d'aide
}

// On essaie de lancer la musique doucement si possible, mais le vrai déclencheur sera le bouton Start ou une interaction
function tryPlayMusic() {
  playBgMusic().catch(() => {
    // Si l'autoplay est bloqué, on attendra une interaction utilisateur
    const onUserInteract = () => {
      playBgMusic();
      window.removeEventListener("click", onUserInteract);
      window.removeEventListener("keydown", onUserInteract);
    };
    window.addEventListener("click", onUserInteract);
    window.addEventListener("keydown", onUserInteract);
  });
}
tryPlayMusic();


function prev() {
  controls.prev();
}
function next() {
  controls.next();
}
function recenter() {
  // recenter = retour à la vue par défaut (aucun objet sélectionné)
  controls.setIndex(-1);
}

function onSelectIndex(i: number) {
  controls.setIndex(i);
}

function onNavigate(route: string) {
  router.push(route);
}
</script>

<style scoped>
.home {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.stage {
  position: relative;
  width: 100%;
  height: 100vh;
}

/* HUD Top Left */
.hud {
  position: absolute;
  z-index: 5;
  left: 32px;
  top: 32px;
}

.hud-top-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.welcome-text {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.hud-logo {
  height: 64px;
  width: auto;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
}

/* Top Controls (Sound + Home) */
.top-controls {
  position: absolute;
  z-index: 101;
  right: 32px;
  top: 32px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 20px;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-menu:hover {
  background: rgba(15, 23, 42, 0.8);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.btn-menu span {
  position: relative;
  top: 1px;
}

/* Navigation UI */
.nav-ui {
  position: absolute;
  left: 32px;
  bottom: 32px;
  z-index: 10;
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 24, 45, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Arrows styling */
.nav-arrow {
  width: 56px;
  height: 56px;
  border-radius: 50%;
}

.nav-arrow:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.nav-arrow:active {
  transform: translateY(0);
}

/* Recenter button styling */
.nav-recenter {
  height: 56px;
  padding: 0 24px;
  border-radius: 28px;
  gap: 10px;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nav-recenter:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.nav-recenter:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.nav-recenter span {
  position: relative;
  top: 1px;
}

/* Object Info Panel */
.object-info-panel {
  position: absolute;
  bottom: 40px;
  right: 40px;
  z-index: 20;
  width: 360px;
  perspective: 1000px;
}

.panel-glass {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-left: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  color: #fff;
  transform-origin: bottom center;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.panel-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.btn-close {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.btn-close:hover {
  color: #fff;
}

.panel-desc {
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 24px;
}

.btn-access {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-access:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.45);
  background: linear-gradient(135deg, #fbbf24 0%, #ea580c 100%);
}

.btn-access:active {
  transform: translateY(0);
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
}

/* Tutorial Modal */
.tutorial-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.tutorial-modal-content {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  max-width: 90%;
  width: 400px;
}

.tutorial-img {
  width: 120px;
  height: auto;
  margin-bottom: 24px;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
}

.tutorial-text {
  font-size: 18px;
  color: #fff;
  margin-bottom: 32px;
  font-weight: 500;
  line-height: 1.5;
}

.btn-tutorial-close {
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  border: none;
  padding: 12px 32px;
  border-radius: 12px;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-tutorial-close:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.45);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
