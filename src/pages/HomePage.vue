<template>
  <section class="home">
    <div class="hud">
      <div class="hud-card">
        <h1>Bienvenue sur Kuuneno</h1>
        <p>Choisissez un objet autour du feu.</p>
      </div>
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

const router = useRouter();
const controls = useHomeControls();

function prev() {
  controls.prev();
}
function next() {
  controls.next();
}
function recenter() {
  // recenter = on garde l’index actuel, HomeScene se recentre automatiquement
  controls.setIndex(controls.activeIndex);
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
</style>
