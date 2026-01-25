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
  buildStars(w, h);
}

function buildStars(w: number, h: number) {
  const count = Math.floor((w * h) / 52000); // dense mais léger
  stars = Array.from({ length: Math.max(220, count) }, () => {
    const r = Math.random() * 1.6 + 0.3;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r,
      a: Math.random() * 0.55 + 0.25,
      vx: (Math.random() - 0.5) * 0.04, // drift doux
      vy: (Math.random() - 0.5) * 0.02,
    };
  });
}

function tick() {
  if (!c.value || !ctx) return;
  const w = c.value.width;
  const h = c.value.height;

  // fond nuit
  const g = ctx.createRadialGradient(w * 0.55, h * 0.6, 40, w * 0.55, h * 0.6, Math.max(w, h) * 0.9);
  g.addColorStop(0, "#0b1e47");
  g.addColorStop(0.55, "#06122c");
  g.addColorStop(1, "#02040d");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // étoiles
  for (const s of stars) {
    s.x += s.vx;
    s.y += s.vy;

    if (s.x < -10) s.x = w + 10;
    if (s.x > w + 10) s.x = -10;
    if (s.y < -10) s.y = h + 10;
    if (s.y > h + 10) s.y = -10;

    const tw = 0.08 * Math.sin((performance.now() / 1200) + s.x * 0.002) + 0.92;
    ctx.globalAlpha = s.a * tw;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  raf = requestAnimationFrame(tick);
}

onMounted(() => {
  resize();
  window.addEventListener("resize", resize);
  raf = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resize);
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
