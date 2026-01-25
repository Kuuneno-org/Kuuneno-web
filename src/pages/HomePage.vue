<template>
  <section class="home">
    <div class="hud">
      <div class="hud-card">
        <h1>Bienvenue sur Kuuneno</h1>
        <p>Choisissez un objet autour du feu.</p>
      </div>
    </div>

    <div class="sound-control">
      <button class="icon" type="button" @click="toggleBgMusic" aria-label="Mute/Unmute">
        <svg v-if="!isBgMusicPlaying" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-icon lucide-volume"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-off-icon lucide-volume-off"><path d="M16 9a5 5 0 0 1 .95 2.293"/><path d="M19.364 5.636a9 9 0 0 1 1.889 9.96"/><path d="m2 2 20 20"/><path d="m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11"/><path d="M9.828 4.172A.686.686 0 0 1 11 4.657v.686"/></svg>
      </button>
    </div>

    <div class="stage">
      <HomeScene
        :active-index="controls.activeIndex"
        @select-index="onSelectIndex"
        @navigate="onNavigate"
      />
    </div>

    <div class="footer">
      <div class="pill">
        Objet : <strong>{{ controls.activeItem.label }}</strong>
      </div>

      <div class="controls">
        <button class="icon" type="button" @click="prev" aria-label="Précédent">←</button>
        <button class="icon" type="button" @click="next" aria-label="Suivant">→</button>
        <button class="btn" type="button" @click="recenter">Recentrer</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import HomeScene from "@/components/home/HomeScene.vue";
import { useHomeControls } from "@/stores/homeControls";
import { useAudio } from "@/composables/useAudio";
import bgMusicUrl from "@/assets/musics/survival-music.mp3";

const router = useRouter();
const controls = useHomeControls();

// Musique de fond
const { play: playBgMusic, pause: pauseBgMusic, isPlaying: isBgMusicPlaying } = useAudio(bgMusicUrl, { volume: 0.15, loop: true });

function toggleBgMusic() {
  if (isBgMusicPlaying.value) {
    pauseBgMusic();
  } else {
    playBgMusic();
  }
}

// On lance la musique
function tryPlayMusic() {
  playBgMusic().catch(() => {
    // Si l'autoplay est bloqué, on attendra une interaction utilisateur (seulement nécessaire, car la musique est en loop)
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
}

.stage {
  position: relative;
  width: 100%;
  height: 100vh;
}

.hud {
  position: absolute;
  z-index: 5;
  left: 22px;
  top: 18px;
}

.hud-card {
  max-width: 420px;
  border-radius: 14px;
  padding: 14px 16px;
  background: rgba(8, 15, 35, 0.55);
  border: 1px solid rgba(255,255,255,0.10);
  backdrop-filter: blur(8px);
  color: rgba(255,255,255,0.92);
}

.hud-card h1 {
  margin: 0 0 6px 0;
  font-size: 26px;
  letter-spacing: 0.2px;
}

.hud-card p {
  margin: 0;
  font-size: 16px;
  opacity: 0.92;
}
.hud-card .hint {
  margin-top: 8px;
  font-size: 13px;
  opacity: 0.75;
}

.footer {
  position: absolute;
  z-index: 6;
  left: 18px;
  right: 18px;
  bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  pointer-events: none;
}

.pill {
  pointer-events: auto;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(8, 15, 35, 0.55);
  border: 1px solid rgba(255,255,255,0.10);
  color: rgba(255,255,255,0.92);
  font-size: 15px;
}

.controls {
  pointer-events: auto;
  display: flex;
  gap: 8px;
  align-items: center;
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(8, 15, 35, 0.55);
  color: rgba(255,255,255,0.92);
  font-size: 18px;
  cursor: pointer;
}

.btn {
  height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(255,180,74,0.35);
  background: rgba(8, 15, 35, 0.55);
  color: rgba(255,255,255,0.92);
  cursor: pointer;
  font-size: 14px;
}

.sound-control {
  position: absolute;
  z-index: 6;
  right: 18px;
  top: 18px;
}
</style>
