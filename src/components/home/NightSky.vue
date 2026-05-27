<template>
  <div class="night">
    <canvas ref="c" class="stars" />
    <div class="vignette" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const c = ref<HTMLCanvasElement | null>(null);

type Star = { x: number; y: number; r: number; a: number; vx: number; vy: number };

let raf = 0;
let ctx: CanvasRenderingContext2D | null = null;
let stars: Star[] = [];
let lastResizeTime = 0;
let cachedGradient: CanvasGradient | null = null;
let cachedGradientWidth = 0;
let cachedGradientHeight = 0;

// Throttle resize pour éviter les recalculs trop fréquents
function throttledResize() {
  const now = Date.now();
  if (now - lastResizeTime > 300) {
    resize();
    lastResizeTime = now;
  }
}

function resize() {
  if (!c.value) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.floor(window.innerWidth * dpr);
  const h = Math.floor(window.innerHeight * dpr);
  c.value.width = w;
  c.value.height = h;
  c.value.style.width = "100%";
  c.value.style.height = "100%";
  ctx = c.value.getContext("2d");
  cachedGradient = null; // Invalider le cache gradient
  buildStars(w, h);
}

function buildStars(w: number, h: number) {
  // Réduire les étoiles sur mobile : max 150 au lieu de 220
  const isMobile = window.innerWidth < 768;
  const maxStars = isMobile ? 120 : 180;
  const count = Math.floor((w * h) / 60000); // densité réduite de 52000 à 60000
  stars = Array.from({ length: Math.max(maxStars, count) }, () => {
    const r = Math.random() * 1.4 + 0.2; // réduit de 1.6 à 1.4
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r,
      a: Math.random() * 0.5 + 0.3, // réduit de 0.55 à 0.5
      vx: (Math.random() - 0.5) * 0.03, // réduit de 0.04 à 0.03
      vy: (Math.random() - 0.5) * 0.015, // réduit de 0.02 à 0.015
    };
  });
}

function getOrCreateGradient(w: number, h: number): CanvasGradient {
  // Cache le gradient pour ne pas le recréer chaque frame
  if (cachedGradient && cachedGradientWidth === w && cachedGradientHeight === h) {
    return cachedGradient;
  }
  
  if (!ctx) throw new Error('Context not initialized');
  
  const g = ctx.createRadialGradient(w * 0.55, h * 0.6, 40, w * 0.55, h * 0.6, Math.max(w, h) * 0.9);
  g.addColorStop(0, "#0b1e47");
  g.addColorStop(0.55, "#06122c");
  g.addColorStop(1, "#02040d");
  
  cachedGradient = g;
  cachedGradientWidth = w;
  cachedGradientHeight = h;
  return g;
}

function tick() {
  if (!c.value || !ctx) return;
  const w = c.value.width;
  const h = c.value.height;
  const now = performance.now();
  const basePhase = now / 1200;

  // fond nuit - utilise le gradient en cache
  ctx.fillStyle = getOrCreateGradient(w, h);
  ctx.fillRect(0, 0, w, h);

  // étoiles - optimisé
  ctx.fillStyle = "#ffffff";
  for (const s of stars) {
    s.x += s.vx;
    s.y += s.vy;

    if (s.x < -10) s.x = w + 10;
    if (s.x > w + 10) s.x = -10;
    if (s.y < -10) s.y = h + 10;
    if (s.y > h + 10) s.y = -10;

    // Calcul d'alpha simplifié : moins d'appels Math.sin
    const tw = 0.08 * Math.sin(basePhase + s.x * 0.002) + 0.92;
    ctx.globalAlpha = s.a * tw;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  raf = requestAnimationFrame(tick);
}

onMounted(() => {
  resize();
  window.addEventListener("resize", throttledResize);
  raf = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", throttledResize);
  cancelAnimationFrame(raf);
});
</script>

<style scoped>
.night {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.stars {
  position: absolute;
  inset: 0;
}


.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(1200px 800px at 50% 55%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.35) 70%, rgba(0, 0, 0, 0.55) 100%);
  pointer-events: none;
}
</style>
