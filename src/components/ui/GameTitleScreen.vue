<template>
  <div
    class="relative h-screen w-screen overflow-hidden bg-black"
  >
    <img
      class="absolute inset-0 h-full w-full object-cover object-center saturate-105 contrast-[1.02]"
      :src="skyUrl"
      alt=""
    />

    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-full" aria-hidden="true">
      <img
        v-for="t in treesPlacements"
        :key="t.key"
        class="absolute h-auto w-[clamp(280px,34vw,520px)] [filter:drop-shadow(0_18px_28px_rgba(0,0,0,0.35))]"
        :src="treesUrl"
        alt=""
        :style="{
          left: t.left,
          bottom: t.bottom,
          transform: t.transform,
          opacity: t.opacity,
        }"
        draggable="false"
      />
    </div>

    <img
      class="absolute bottom-0 left-0 h-[clamp(220px,34vh,420px)] w-full object-cover object-bottom"
      :src="fieldUrl"
      alt=""
      draggable="false"
    />

    <video
      v-show="showIntroVideo"
      ref="videoRef"
      class="absolute inset-0 z-10 h-full w-full object-cover object-center"
      :src="transitionUrl"
      muted
      playsinline
      preload="auto"
      @timeupdate="onIntroTimeUpdate"
      @ended="onIntroEnded"
    />

    <div class="absolute inset-0 z-20 flex items-center justify-center p-6 md:p-10">
      <!-- Menu du titre -->
      <div
        v-if="!gameStarted"
        ref="panelRef"
        class="w-full max-w-xl opacity-0"
      >
        <div class="flex flex-col items-center gap-8 text-center">
          <div ref="logoWrapRef" class="flex items-center justify-center">
            <img
              class="h-auto w-[clamp(180px,22vw,320px)] select-none [filter:drop-shadow(0_24px_80px_rgba(0,0,0,0.75))]"
              :src="brandLogoUrl"
              alt="Kuunenos"
              draggable="false"
            />
          </div>

          <div ref="menuWrapRef" class="flex w-full flex-col items-center gap-3">
            <button
              v-for="item in menuItems"
              :key="item.key"
              ref="menuBtnRefs"
              class="group relative w-[min(440px,82vw)] overflow-hidden rounded-2xl border border-white/15 bg-slate-950/30 px-5 py-4 text-center text-sm font-semibold uppercase tracking-[0.22em] text-white/90 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-glow/45 hover:bg-white/10 hover:shadow-[0_18px_55px_rgba(245,158,11,0.18)] active:translate-y-0 active:scale-[0.98]"
              type="button"
              @click="handleMenuClick(item.emit)"
            >
              <span
                class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[linear-gradient(90deg,rgba(245,158,11,0)_0%,rgba(245,158,11,0.15)_52%,rgba(245,158,11,0.06)_100%)]"
                aria-hidden="true"
              />
              <span
                class="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-[330%]"
                aria-hidden="true"
              />
              <span
                class="pointer-events-none absolute left-4 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-glow/0 blur-sm transition-all duration-300 group-hover:bg-glow/70 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.75)]"
                aria-hidden="true"
              />
              <span class="relative flex items-center justify-center gap-4">
                <span class="text-glow/70 transition-all duration-300 group-hover:scale-125 group-hover:text-glow group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.75)]">✦</span>
                <span class="transition-colors duration-300 group-hover:text-white">{{ item.label }}</span>
                <span class="text-glow/70 transition-all duration-300 group-hover:scale-125 group-hover:text-glow group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.75)]">✦</span>
              </span>
            </button>
          </div>
          <div ref="promoRef" class="w-[min(520px,82vw)] text-center">
            <div class="inline-flex items-center gap-3 rounded-full border border-glow/20 bg-slate-950/35 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65 shadow-[0_12px_40px_rgba(0,0,0,0.24)] backdrop-blur-md">
              <span class="h-2 w-2 rounded-full bg-glow shadow-[0_0_14px_rgba(245,158,11,0.9)]" />
              <span class="text-glow/90">En cours</span>
              <span class="h-3 w-px bg-white/15" />
              <span>Jeu en développement</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Launcher du jeu Java -->
      <JavaGameLauncher
        v-else
        @closed="handleGameClosed"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import gsap from "gsap";
import JavaGameLauncher from "@/components/game/JavaGameLauncher.vue";
import skyUrl from "@/assets/gametitle/sky.png";
import fieldUrl from "@/assets/gametitle/field.png";
import treesUrl from "@/assets/gametitle/trees.png";
import brandLogoUrl from "@/assets/logo/logo.png";
import transitionUrl from "@/assets/transition.mp4";

const router = useRouter();

const emit = defineEmits<(e: "start" | "continue" | "options" | "credits" | "back") => void>();

const gameStarted = ref(false);

type TreePlacement = {
  key: string;
  left: string;
  bottom: string;
  transform: string;
  opacity: number;
};

const treesPlacements: TreePlacement[] = [
  { key: "t1", left: "12%", bottom: "26%", transform: "translateX(-50%) scale(1.5)", opacity: 0.95 },
  { key: "t2", left: "36%", bottom: "24%", transform: "translateX(-50%) scale(1.5) scaleX(-1)", opacity: 0.9 },
  { key: "t3", left: "64%", bottom: "25%", transform: "translateX(-50%) scale(1.75)", opacity: 0.92 },
  { key: "t4", left: "86%", bottom: "24%", transform: "translateX(-50%) scale(1.5) scaleX(-1)", opacity: 0.88 },
];

const menuItems: Array<{ key: string; label: string; emit: "start" | "options" | "credits" | "back" }> = [
  { key: "new", label: "Nouveau jeu", emit: "start" },
  { key: "opt", label: "Options", emit: "options" },
  { key: "cred", label: "Crédits", emit: "credits" },
  { key: "home", label: "Retour à l'accueil", emit: "back" },
];

const showIntroVideo = ref(true);
const videoRef = ref<HTMLVideoElement | null>(null);
const panelRef = ref<HTMLDivElement | null>(null);
const logoWrapRef = ref<HTMLElement | null>(null);
const menuWrapRef = ref<HTMLElement | null>(null);
const menuBtnRefs = ref<HTMLButtonElement[]>([]);
const promoRef = ref<HTMLElement | null>(null);
const overlayTriggered = ref(false);

async function showOverlay() {
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  if (panelRef.value) {
    tl.fromTo(
      panelRef.value,
      { opacity: 0, y: 20, filter: "blur(14px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.65 },
      0
    );
  }

  if (logoWrapRef.value) {
    tl.fromTo(
      logoWrapRef.value,
      { opacity: 0, y: -18, scale: 0.92, filter: "blur(10px)" },
      { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.8, ease: "expo.out" },
      0.05
    );
  }

  if (menuWrapRef.value) {
    tl.fromTo(menuWrapRef.value, { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.22);
  }

  if (menuBtnRefs.value.length > 0) {
    tl.fromTo(
      menuBtnRefs.value,
      { opacity: 0, x: 12, y: 6, filter: "blur(10px)" },
      { opacity: 1, x: 0, y: 0, filter: "blur(0px)", duration: 0.55, stagger: 0.08 },
      0.25
    );
  }

  if (promoRef.value) {
    tl.fromTo(promoRef.value, { opacity: 0, y: 10, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55 }, 0.42);
  }
}

function triggerOverlay() {
  if (overlayTriggered.value) return;
  overlayTriggered.value = true;
  showOverlay();
}

function onIntroTimeUpdate() {
  const v = videoRef.value;
  if (!v) return;
  const d = v.duration;
  if (!Number.isFinite(d) || d <= 0) return;
  if (d - v.currentTime <= 1) triggerOverlay();
}

function onIntroEnded() {
  triggerOverlay();
}
function handleMenuClick(action: "start" | "options" | "credits" | "back") {
  if (action === "start") {
    gameStarted.value = true;
    emit(action);
    return;
  }

  if (action === "back") {
    router.push("/");
    return;
  }

  if (action === "credits") {
    router.push("/credits");
    return;
  }
}

function handleGameClosed() {
  gameStarted.value = false;
  // Reset overlay trigger to show menu animations again
  overlayTriggered.value = false;
  // Trigger overlay animation when menu reappears
  setTimeout(() => {
    triggerOverlay();
  }, 100);
}

onMounted(() => {
  const v = videoRef.value;
  if (!v) return;
  v.muted = true;
  v.playsInline = true;
  v.play().catch(() => {
    triggerOverlay();
  });
});
</script>
