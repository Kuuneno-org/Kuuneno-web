<template>
  <div ref="wrap" class="wrap" @pointermove="onPointerMove" @click="onClick">
    <transition name="fade">
      <video
        v-if="showVideo"
        ref="videoEl"
        class="book-video"
        muted
        playsinline
        crossorigin="anonymous"
      >
        <source :src="videoUrl" type="video/mp4" />
      </video>
    </transition>
    <canvas ref="canvas" class="canvas"></canvas>

    <div class="tip" v-if="showTip">
      Cliquez sur un objet
    </div>

  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, computed } from "vue";
import * as THREE from "three";
import type { HomeNavItem } from "@/stores/homeControls";
import videoUrl from "@/assets/Livre.mp4";

const props = defineProps<{
  activeIndex: number;
}>();

const emit = defineEmits<{
  (e: "select-index", i: number): void;
  (e: "navigate", route: string): void;
}>();

const wrap = ref<HTMLDivElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const showTip = ref(true);

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;

let root: THREE.Group | null = null;
let carousel: THREE.Group | null = null;

let raycaster: THREE.Raycaster | null = null;
const pointer = new THREE.Vector2();

const clickable: Array<{ mesh: THREE.Object3D; item: HomeNavItem; index: number }> = [];

const items: HomeNavItem[] = [
  { kind: "mask", label: "Histoire interactive", route: "/histoire" },
  { kind: "altar", label: "Crédits", route: "/credits" },
  { kind: "book", label: "Lore", route: "/lore" },
  { kind: "gamepad", label: "Mini-jeu", route: "/mini-jeu" },
];
const isActiveItemLore = computed(() => {
  const item = items[props.activeIndex];
  return item?.kind === "book";
});

const showVideo = ref(false);
const videoEl = ref<HTMLVideoElement | null>(null);
let videoTimeout: ReturnType<typeof setTimeout> | null = null;

watch(isActiveItemLore, (isLore) => {
  if (videoTimeout) clearTimeout(videoTimeout);

  if (isLore) {
    // Délai pour laisser le temps au carrousel de tourner
    videoTimeout = setTimeout(() => {
      showVideo.value = true;
      // nextTick pour être sûr que l'élément est dans le DOM
      setTimeout(() => {
        if (videoEl.value) {
          videoEl.value.currentTime = 0;
          videoEl.value.play().catch(() => {});
        }
      }, 50);
    }, 500);
  } else {
    showVideo.value = false;
  }
}, { immediate: true });

let raf = 0;
let targetRotationY = 0; // rotation cible du carousel
const ROTATE_SPEED = 0.07;

function resize() {
  if (!wrap.value || !renderer || !camera) return;
  const w = wrap.value.clientWidth;
  const h = wrap.value.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function setTargetToIndex(index: number) {
  // Objet i est placé à angle i*step → pour l’avoir en face, on tourne à -i*step
  const step = (Math.PI * 2) / items.length;
  targetRotationY = -index * step;
}

function makeFire(): THREE.Mesh {
  const mat = new THREE.MeshStandardMaterial({
    color: "#ffb24a",
    emissive: new THREE.Color("#ff9b3d"),
    emissiveIntensity: 0.45,
    roughness: 0.6,
    metalness: 0.0,
  });

  const mesh = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.6, 28), mat);
  mesh.position.set(0, -0.05, 0);
  return mesh;
}

/* ===================== OBJETS D ===================== */

function makeMask(): THREE.Group {
  const g = new THREE.Group();

  const face = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 32, 32),
    new THREE.MeshStandardMaterial({ color: "#e9f0ff", roughness: 0.5 })
  );
  face.scale.set(1.2, 1, 0.55);
  g.add(face);

  const eyeMat = new THREE.MeshStandardMaterial({ color: "#0b1430" });
  const eye1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), eyeMat);
  eye1.position.set(-0.15, 0.05, 0.22);
  g.add(eye1);

  const eye2 = eye1.clone();
  eye2.position.x = 0.15;
  g.add(eye2);

  const hornMat = new THREE.MeshStandardMaterial({ color: "#ffb24a", roughness: 0.7 });
  const horn1 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 16), hornMat);
  horn1.position.set(-0.22, 0.30, 0.05);
  horn1.rotation.z = 0.35;
  g.add(horn1);

  const horn2 = horn1.clone();
  horn2.position.x = 0.22;
  horn2.rotation.z = -0.35;
  g.add(horn2);

  return g;
}

function makeAltar(): THREE.Group {
  const g = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.65, 0.28, 40),
    new THREE.MeshStandardMaterial({ color: "#12214a", roughness: 0.85 })
  );
  g.add(base);

  const crystal = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.22),
    new THREE.MeshStandardMaterial({
      color: "#ffffff",
      emissive: "#7aa7ff",
      emissiveIntensity: 0.85,
      transparent: true,
      opacity: 0.92,
      roughness: 0.35,
    })
  );
  crystal.position.y = 0.32;
  g.add(crystal);

  return g;
}

function makeBook(): THREE.Group {
  const g = new THREE.Group();

  const cover = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.09, 0.44),
    new THREE.MeshStandardMaterial({ color: "#0f1e44", roughness: 0.9 })
  );
  g.add(cover);

  const pages = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.05, 0.38),
    new THREE.MeshStandardMaterial({ color: "#f7f9ff", roughness: 0.65 })
  );
  pages.position.y = 0.07;
  g.add(pages);

  const spine = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.095, 0.44),
    new THREE.MeshStandardMaterial({ color: "#ffb24a", roughness: 0.55 })
  );
  spine.position.x = 0.31;
  g.add(spine);

  return g;
}

function makeGamepad(): THREE.Group {
  const g = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.18, 0.40),
    new THREE.MeshStandardMaterial({ color: "#1a2b55", roughness: 0.85 })
  );
  g.add(body);

  const btn = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 16, 16),
    new THREE.MeshStandardMaterial({ color: "#ffb24a", roughness: 0.4 })
  );
  btn.position.set(0.22, 0.08, 0.10);
  g.add(btn);

  const btn2 = btn.clone();
  btn2.position.set(0.30, 0.05, -0.02);
  btn2.scale.setScalar(0.9);
  g.add(btn2);

  return g;
}

function makeItemMesh(kind: HomeNavItem["kind"]): THREE.Object3D {
  switch (kind) {
    case "mask": return makeMask();
    case "altar": return makeAltar();
    case "book": return makeBook();
    case "gamepad": return makeGamepad();
    default: return new THREE.Group();
  }
}

function initScene() {
  if (!wrap.value || !canvas.value) return;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#030814", 10, 34);

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 120);
  camera.position.set(0, 3.0, 8.2);
  camera.lookAt(0, 0.5, 0);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  raycaster = new THREE.Raycaster();

  // Lumières (bleu nuit + feu orangé)
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const key = new THREE.DirectionalLight(0x7aa7ff, 0.55);
  key.position.set(4, 6, 3);
  scene.add(key);

  const fireLight = new THREE.PointLight(0xffb24a, 1.45, 14);
  fireLight.position.set(0, 1.0, 0);
  scene.add(fireLight);

  root = new THREE.Group();
  scene.add(root);

  // === SOL / DEMI-CERCLE NOIR (IMPORTANT) ===================
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(9.2, 64),
    new THREE.MeshStandardMaterial({
      color: "#02040a",
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0.90,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.9;
  root.add(ground);

  // Socle du feu
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.55, 0.45, 40),
    new THREE.MeshStandardMaterial({ color: "#0b1430", roughness: 0.95, metalness: 0.05 })
  );
  base.position.set(0, -0.7, 0);
  root.add(base);

  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 0.95, 0.22, 36),
    new THREE.MeshStandardMaterial({ color: "#081025", roughness: 1 })
  );
  inner.position.set(0, -0.48, 0);
  root.add(inner);

  const fire = makeFire();
  fire.position.y = 0.1;
  root.add(fire);

  // Carousel
  carousel = new THREE.Group();
  root.add(carousel);

  // Placement des objets
  const radius = 3.4;
  const step = (Math.PI * 2) / items.length;

  items.forEach((it, i) => {
    const angle = i * step;

    const obj = makeItemMesh(it.kind);
    obj.position.set(Math.sin(angle) * radius, -0.55, Math.cos(angle) * radius);
    obj.lookAt(0, -0.55, 0);

    // Important : tag pour raycast
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        clickable.push({ mesh: child, item: it, index: i });
      }
    });

    carousel!.add(obj);
  });

  // rotation initiale centrée
  setTargetToIndex(props.activeIndex);
  carousel.rotation.y = targetRotationY;

  resize();
  window.addEventListener("resize", resize);

  animate();
}

function animate() {
  if (!renderer || !scene || !camera || !carousel) return;

  // rotation douce vers la cible (centrage)
  const dy = targetRotationY - carousel.rotation.y;
  carousel.rotation.y += dy * ROTATE_SPEED;

  renderer.render(scene, camera);
  raf = requestAnimationFrame(animate);
}

function cleanup() {
  cancelAnimationFrame(raf);
  window.removeEventListener("resize", resize);

  clickable.splice(0, clickable.length);

  renderer?.dispose();
  renderer = null;
  scene = null;
  camera = null;
  root = null;
  carousel = null;
  raycaster = null;
}

/* ===== Interactions souris ===== */

function onPointerMove(e: PointerEvent) {
  if (!wrap.value) return;
  const rect = wrap.value.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
}

function onClick() {
  if (!raycaster || !camera || !scene) return;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(clickable.map((c) => c.mesh), true);

  if (intersects.length === 0) return;

  const hit = intersects[0].object;
  const found = clickable.find((c) => c.mesh === hit || c.mesh.uuid === hit.uuid);

  if (!found) return;

  showTip.value = false;
  emit("select-index", found.index);
  emit("navigate", found.item.route);
}

/* ===== Réagir aux flèches (activeIndex) ===== */
watch(
  () => props.activeIndex,
  (idx) => {
    if (!carousel) return;
    showTip.value = false;
    setTargetToIndex(idx);
  }
);

onMounted(() => initScene());
onBeforeUnmount(() => cleanup());
</script>

<style scoped>
.wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.tip {
  position: absolute;
  left: 50%;
  top: 52%;
  transform: translate(-50%, -50%);
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(8, 15, 35, 0.55);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.90);
  font-size: 14px;
  pointer-events: none;
}

.book-video {
  position: absolute;
  top: 92%;
  left: 50%;
  transform: translate(-50%, -50%) rotateX(60deg);
  width: 160px;
  height: 160px;
  object-fit: cover;
  z-index: 10;
  /* opacity: 0.9; */
  pointer-events: none;
  /* box-shadow: 0 0 20px rgba(255, 178, 74, 0.3); */
  border-radius: 4px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
