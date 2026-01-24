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

    <GhostMask
      v-if="isSceneReady && scene && camera"
      :scene="scene"
      :camera="camera"
    />

    <MagicBook 
      v-if="isSceneReady && scene && camera" 
      :scene="scene" 
    />

    <MagicCredits
      v-if="isSceneReady && scene && camera" 
      :scene="scene" 
    />

    <MagicGamepad
      v-if="isSceneReady && scene && camera" 
      :scene="scene" 
    />

  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, computed } from "vue";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GhostMask from "./GhostMask.vue";
import MagicBook from "./MagicBook.vue";
import MagicCredits from "./MagicCredits.vue";
import MagicGamepad from "./MagicGamepad.vue";
import type { HomeNavItem } from "@/stores/homeControls";
import videoUrl from "@/assets/Livre.mp4";
import campfireUrl from "@/assets/3D/Ambience camping/camping_buscraft_ambience/scene.gltf?url";
import treeUrl from "@/assets/3D/KayKit_Forest_Nature_Pack_1.0_FREE/Assets/gltf/Tree_4_A_Color1.gltf?url";
import rockUrl from "@/assets/3D/KayKit_Forest_Nature_Pack_1.0_FREE/Assets/gltf/Rock_2_A_Color1.gltf?url";

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
const isSceneReady = ref(false);

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let controls: OrbitControls | null = null;
let mixer: THREE.AnimationMixer | null = null;
const clock = new THREE.Clock();

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

// Évite de faire un tour complet inutilement. On place la cible à la position la plus proche.
function setTargetToIndex(index: number) {
  // Objet i est placé à angle i*step → pour l’avoir en face, on tourne à -i*step
  const step = (Math.PI * 2) / items.length;
  const rawTarget = -index * step;

  // On cherche la cible équivalente la plus proche de la rotation actuelle
  // pour éviter de faire un tour complet inutilement.
  const current = targetRotationY;
  const twoPi = Math.PI * 2;

  let diff = (rawTarget - current) % twoPi;
  // Ramener diff dans [-PI, PI]
  if (diff > Math.PI) diff -= twoPi;
  if (diff < -Math.PI) diff += twoPi;

  targetRotationY = current + diff;
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
  // Vue plus "frontale" et légèrement surélevée (en face du feu)
  camera.position.set(20, 12, 5);
  camera.lookAt(5, 1.5, 0); // Regarde un peu au-dessus du sol (le feu)
  // scene.add(camera); // Plus nécessaire d'ajouter la caméra à la scène si le mask n'est plus enfant

  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 0.1; // Permettre de zoomer très près
  controls.maxDistance = 50; // On permet de reculer davantage pour voir la scène large

  // Restriction : on ne tourne qu'à l'horizontale (souris axe X -> rotation autour de Y)
  // On bloque l'angle vertical (polaire) pour ne pas passer sous le sol
  controls.maxPolarAngle = Math.PI / 2;
  // Navigation (pan) uniquement sur le plan horizontal (X, Z)
  controls.screenSpacePanning = false;

  controls.target.set(0, 1.5, 0);

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

  // === SOL / SCÈNE GLB ===================
  const loader = new GLTFLoader();
  
  // On signale que la scène est prête pour afficher les composants enfants
  isSceneReady.value = true;

  // Création d'un sol étendu pour combler le vide
  const groundGeo = new THREE.CircleGeometry(60, 64);
  const groundMat = new THREE.MeshStandardMaterial({ 
    color: "#0b1420", // Teinte sombre bleu-vert nuit
    roughness: 0.9,
    metalness: 0.1 
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.05; // Juste un peu sous le modèle principal
  ground.receiveShadow = true;
  root.add(ground);

  // Chargement des éléments de décor (Arbres / Rochers)
  const loadDecor = (url: string, count: number, minR: number, maxR: number, scale: number) => {
    loader.load(url, (gltf: GLTF) => {
      const model = gltf.scene;
      // On traverse pour activer les ombres
      model.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });

      for (let i = 0; i < count; i++) {
        const clone = model.clone();
        
        // On cherche une position qui ne bloque pas la vue caméra -> centre
        let x = 0, z = 0;
        let attempts = 0;
        let valid = false;

        while (!valid && attempts < 50) {
          attempts++;
          const angle = Math.random() * Math.PI * 2;
          const radius = minR + Math.random() * (maxR - minR);
          x = Math.cos(angle) * radius;
          z = Math.sin(angle) * radius;

          // Segment caméra (20, 8) -> centre (0, 0)
          // On vérifie la distance du point (x, z) à ce segment
          const cx = 20, cz = 8; // Position caméra
          const tx = 0, tz = 0;  // Cible
          
          // Distance point-segment
          const l2 = (cx - tx)**2 + (cz - tz)**2;
          let t = ((x - tx) * (cx - tx) + (z - tz) * (cz - tz)) / l2;
          t = Math.max(0, Math.min(1, t));
          const projX = tx + t * (cx - tx);
          const projZ = tz + t * (cz - tz);
          const dist = Math.hypot(x - projX, z - projZ);

          // Si l'objet est trop près de l'axe de vision, on rejette
          if (dist > 4.5) {
            valid = true;
          }
        }

        if (valid) {
          clone.position.set(x, -2.0, z);
          // Rotation aléatoire
          clone.rotation.y = Math.random() * Math.PI * 2;
          // Scale aléatoire
          const s = scale * (0.8 + Math.random() * 0.4);
          clone.scale.set(s, s, s);
          root?.add(clone);
        }
      }
    });
  };

  // Ajouter des arbres et rochers autour
  loadDecor(treeUrl, 25, 12, 45, 1.5);
  loadDecor(rockUrl, 15, 8, 30, 1.0);

  loader.load(
    campfireUrl,
    (gltf: GLTF) => {
      const model = gltf.scene;

      // Centrage et mise à l'échelle automatiques
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());

      // 1. Mise à l'échelle
      const maxDim = Math.max(size.x, size.z);
      const targetSize = 40;
      const scaleFactor = targetSize / maxDim;
      
      model.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // 2. Recentrage intelligent
      model.updateMatrixWorld(true); // Appliquer le scale
      const finalBox = new THREE.Box3().setFromObject(model);
      
      let targetCenter = finalBox.getCenter(new THREE.Vector3());
      let bestNode: THREE.Object3D | null = null;
      const candidates: THREE.Object3D[] = [];
      model.traverse((child) => candidates.push(child));

      // On cherche un nœud pertinent pour le centrage (Logs, Campfire, Fire...)
      for (const child of candidates) {
         const n = child.name.toLowerCase();
         // On privilégie les objets qui semblent être le "cœur" du feu de camp
         if (!bestNode && (n.includes("logs") || n.includes("campfire") || n.includes("wood"))) {
            bestNode = child;
         }
      }
      
      // Si on n'a pas trouvé de bois/campfire, on cherche le feu/flamme
      if (!bestNode) {
          for (const child of candidates) {
             const n = child.name.toLowerCase();
             if (!bestNode && (n.includes("fire") || n.includes("flame"))) {
                bestNode = child;
             }
          }
      }

      if (bestNode) {
          console.log("Recentrage sur l'objet :", bestNode.name);
          const b = new THREE.Box3().setFromObject(bestNode);
          targetCenter = b.getCenter(new THREE.Vector3());
      } else {
          console.log("Aucun objet spécifique trouvé, centrage global.");
      }

      // Application du décalage
      // On veut que targetCenter aille en 0,0,0
      // model.position += (0,0,0) - targetCenter
      model.position.x -= targetCenter.x;
      model.position.z -= targetCenter.z;
      
      // 3. Alignement vertical (bas du modèle à -1.0)
       // On utilise la boite globale pour le sol
       const finalMinY = finalBox.min.y;
      
      // On veut que finalMinY aille à -1.0
      // Actuellement le bas est à finalMinY. 
      // Si on fait model.position.y -= finalMinY, le bas est à 0.
      // Puis on met à -1.0.
      model.position.y -= finalMinY; 
      model.position.y -= 2.0; // On descend encore un peu plus le sol pour que la caméra soit plus "haute" relativement 
      
      // 4. Gestion des animations
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          mixer!.clipAction(clip).play();
        });
        console.log("Animations trouvées et lancées :", gltf.animations.length);
      }

      root!.add(model);
    },
    undefined,
    (error: unknown) => {
      console.error("Erreur chargement GLB:", error);
    }
  );

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

  controls?.update();

  const delta = clock.getDelta();
  if (mixer) {
    mixer.update(delta);
  }

  renderer.render(scene, camera);
  raf = requestAnimationFrame(animate);
}

function cleanup() {
  cancelAnimationFrame(raf);
  window.removeEventListener("resize", resize);

  clickable.splice(0, clickable.length);

  renderer?.dispose();
  controls?.dispose();
  renderer = null;
  scene = null;
  camera = null;
  controls = null;
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
