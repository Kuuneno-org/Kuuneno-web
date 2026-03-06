<template>
  <div ref="wrap" class="wrap">
    <canvas ref="canvas" class="canvas"></canvas>

    <div class="tip" v-if="showTip && isGameStarted">
      Utilisez les flèches pour naviguer
    </div>

    <GhostMask
      v-if="isSceneReady && scene && camera"
      :scene="scene"
      :camera="camera"
    />

    <MagicBook
      v-if="isSceneReady && scene && camera"
      :scene="scene"
      :active="isActiveItemLore"
    />

    <MagicCredits
      v-if="isSceneReady && scene && camera"
      :scene="scene"
    />

    <MagicGamepad
      v-if="isSceneReady && scene && camera"
      :scene="scene" 
    />

    <MagicMoon
      v-if="isSceneReady && scene && camera" 
      :scene="scene" 
    />

    <PikminEvol
      v-if="isSceneReady && scene"
      :scene="scene"
    />

    <KuunenoFox
      v-if="isSceneReady && scene"
      :scene="scene"
    />

    <KuunenoSample
      v-if="isSceneReady && scene"
      :scene="scene"
    />

    <RoundTable
      v-if="isSceneReady && scene"
      :scene="scene"
    />

    <!-- <SampleAnim
      v-if="isSceneReady && scene"
      :scene="scene"
    /> -->


  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, computed } from "vue";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import GhostMask from "../3D_Components/GhostMask.vue";
import MagicBook from "../3D_Components/MagicBook.vue";
import MagicCredits from "../3D_Components/MagicCredits.vue";
import MagicGamepad from "../3D_Components/MagicGamepad.vue";
import MagicMoon from "../3D_Components/MagicMoon.vue";
import KuunenoFox from "../3D_Components/KuunenoFox.vue";
import PikminEvol from "../3D_Components/PikminEvol.vue";
import type { HomeNavItem } from "@/stores/homeControls";
const campfireUrl = "/3D/Ambience camping/camping_buscraft_ambience/scene.gltf";
const treeUrl = "/3D/KayKit_Forest_Nature_Pack_1.0_FREE/Assets/gltf/Tree_4_A_Color1.gltf";
const tree2Url = "/3D/KayKit_Forest_Nature_Pack_1.0_FREE/Assets/gltf/Tree_1_A_Color1.gltf";
const tree3Url = "/3D/KayKit_Forest_Nature_Pack_1.0_FREE/Assets/gltf/Tree_2_B_Color1.gltf";
const tree4Url = "/3D/KayKit_Forest_Nature_Pack_1.0_FREE/Assets/gltf/Tree_2_A_Color1.gltf";
const tree5Url = "/3D/KayKit_Forest_Nature_Pack_1.0_FREE/Assets/gltf/Tree_3_A_Color1.gltf";
const tree6Url = "/3D/KayKit_Forest_Nature_Pack_1.0_FREE/Assets/gltf/Tree_3_B_Color1.gltf";
const rockUrl = "/3D/KayKit_Forest_Nature_Pack_1.0_FREE/Assets/gltf/Rock_2_A_Color1.gltf";
const rock2Url = "/3D/KayKit_Forest_Nature_Pack_1.0_FREE/Assets/gltf/Rock_1_A_Color1.gltf";
const bushUrl = "/3D/KayKit_Forest_Nature_Pack_1.0_FREE/Assets/gltf/Bush_1_A_Color1.gltf";
import KuunenoSample from "../3D_Components/KuunenoSample.vue";
import RoundTable from "../3D_Components/RoundTable.vue";
// import SampleAnim from "../3D_Components/SampleAnim.vue";

const props = defineProps<{
  activeIndex: number;
  isGameStarted: boolean;
}>();

const emit = defineEmits<{
  (e: "select-index", i: number): void;
  (e: "navigate", route: string): void;
  (e: "scene-entered"): void;
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

const items: HomeNavItem[] = [
  { kind: "mask", label: "Histoire interactive", route: "/histoire" },
  { kind: "altar", label: "Crédits", route: "/credits" },
  { kind: "book", label: "Lore", route: "/lore" },
  { kind: "gamepad", label: "Mini-jeu", route: "/mini-jeu" },
];

// Configuration des vues caméra pour chaque objet
// Positions basées sur les emplacements des objets :
// Mask: (5, 3, -10)
// Credits (Altar): (-5, 1.8, 10)
// Book: (10, -2.0, 6)
// Gamepad: (0, 0.80, 0)
// Les trois paramètres de THREE.Vector3 correspondent aux coordonnées 3D :
// x (abscisse), y (ordonnée), z (profondeur).
// Ici, ils définissent la position (pos) et le point regardé (target)
// pour chaque vue caméra afin de cadrer précisément les objets 3D.
const cameraViews = [
  // Mask
  {
    pos: new THREE.Vector3(10, 4, -5),
    target: new THREE.Vector3(5, 3, -10)
  },
  // Credits
  {
    // Position calculée pour être "en face" de l'autel (qui est à -9, 0.9, 6)
    // On se place entre le feu (0,0,0) et l'autel, mais assez proche de l'autel pour bien le voir
    // L'autel est loin (-9, 6), on s'approche
    pos: new THREE.Vector3(-4.8, 3.0, 3.2),
    target: new THREE.Vector3(-9, 2.0, 6)
  },
  // Book
  {
    pos: new THREE.Vector3(13, 3, 8),
    target: new THREE.Vector3(10, 0.5, 5)
  },
  // Gamepad
  {
    pos: new THREE.Vector3(1.6, 2.2, 1.6),
    target: new THREE.Vector3(0, 0.8, 0)
  }
];

// Vue par défaut (Feu de camp)
const defaultView = {
  pos: new THREE.Vector3(15, 3.5, 15),
  target: new THREE.Vector3(0, 1, 0)
};

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
    videoTimeout = setTimeout(() => {
      showVideo.value = true;
      setTimeout(() => {
        if (videoEl.value) {
          videoEl.value.currentTime = 0;
          videoEl.value.play().catch(() => {});
        }
      }, 50);
    }, 1000); // Délai un peu plus long pour laisser la caméra arriver
  } else {
    showVideo.value = false;
  }
}, { immediate: true });

let raf = 0;

function resize() {
  if (!wrap.value || !renderer || !camera) return;
  const w = wrap.value.clientWidth;
  const h = wrap.value.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function moveCameraTo(index: number, duration: number = 1.5, ease: string = "power2.inOut", onComplete?: () => void) {
  if (!camera || !controls) return;

  const view = (index >= 0 && index < cameraViews.length) 
    ? cameraViews[index] 
    : defaultView;

  // Animation de la position de la caméra
  gsap.to(camera.position, {
    x: view.pos.x,
    y: view.pos.y,
    z: view.pos.z,
    duration: duration,
    ease: ease,
    onComplete: onComplete // On appelle le callback à la fin de l'animation de position
  });

  // Animation de la cible des contrôles
  gsap.to(controls.target, {
    x: view.target.x,
    y: view.target.y,
    z: view.target.z,
    duration: duration,
    ease: ease,
    onUpdate: () => {
      controls?.update();
    }
  });
}

function initScene() {
  if (!wrap.value || !canvas.value) return;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#030814", 10, 34);

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 120);
  camera.position.copy(defaultView.pos);
  camera.lookAt(defaultView.target);

  renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 0.1;
  controls.maxDistance = 50;

  // Restriction : on ne tourne qu'à l'horizontale (souris axe X -> rotation autour de Y)
  // On bloque l'angle vertical (polaire) pour ne pas passer sous le sol
  controls.maxPolarAngle = Math.PI / 2;
  // Navigation (pan) uniquement sur le plan horizontal (X, Z)
  controls.screenSpacePanning = false;

  controls.target.copy(defaultView.target);

  if (!props.isGameStarted) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;
    // Position éloignée pour le menu
    camera.position.set(35, 15, 35);
  }

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

  isSceneReady.value = true;

  // Création d'un sol étendu
  const groundGeo = new THREE.CircleGeometry(60, 64);
  const groundMat = new THREE.MeshStandardMaterial({
    color: "#0b1420",
    roughness: 0.9,
    metalness: 0.1
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.05;
  ground.receiveShadow = true;
  root.add(ground);

  // Chargement des éléments de décor
  const loadDecor = (url: string, count: number, minR: number, maxR: number, scale: number) => {
    loader.load(url, (gltf: GLTF) => {
      const model = gltf.scene;
      model.traverse((c) => {
        if ((c as THREE.Mesh).isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });

      for (let i = 0; i < count; i++) {
        const clone = model.clone();
        let x = 0, z = 0;
        let attempts = 0;
        let valid = false;

        while (!valid && attempts < 50) {
          attempts++;
          const angle = Math.random() * Math.PI * 2;
          const radius = minR + Math.random() * (maxR - minR);
          x = Math.cos(angle) * radius;
          z = Math.sin(angle) * radius;

          // Vérification distance vision
          const cx = 20, cz = 8;
          const tx = 0, tz = 0;
          const l2 = (cx - tx)**2 + (cz - tz)**2;
          let t = ((x - tx) * (cx - tx) + (z - tz) * (cz - tz)) / l2;
          t = Math.max(0, Math.min(1, t));
          const projX = tx + t * (cx - tx);
          const projZ = tz + t * (cz - tz);
          const dist = Math.hypot(x - projX, z - projZ);

          if (dist > 4.5) {
            valid = true;
          }
        }

        if (valid) {
          clone.position.set(x, -2.0, z);
          clone.rotation.y = Math.random() * Math.PI * 2;
          const s = scale * (0.8 + Math.random() * 0.4);
          clone.scale.set(s, s, s);
          root?.add(clone);
        }
      }
    });
  };

  // Plus d'arbres et plus loin
  loadDecor(treeUrl, 120, 20, 90, 1.5);
  loadDecor(tree2Url, 100, 22, 85, 1.6);
  loadDecor(tree3Url, 100, 25, 95, 1.4);
  loadDecor(tree4Url, 100, 28, 90, 1.5);
  loadDecor(tree5Url, 80, 30, 95, 1.7);
  loadDecor(tree6Url, 80, 32, 90, 1.3);
  
  // Rochers et buissons
  loadDecor(rockUrl, 50, 15, 60, 1.0);
  loadDecor(rock2Url, 50, 18, 65, 1.2);
  loadDecor(bushUrl, 150, 12, 55, 0.8);

  loader.load(
    campfireUrl,
    (gltf: GLTF) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.z);
      const targetSize = 40;
      const scaleFactor = targetSize / maxDim;
      
      model.scale.set(scaleFactor, scaleFactor, scaleFactor);
      model.updateMatrixWorld(true);
      const finalBox = new THREE.Box3().setFromObject(model);
      
      let targetCenter = finalBox.getCenter(new THREE.Vector3());
      let bestNode: THREE.Object3D | null = null;
      const candidates: THREE.Object3D[] = [];
      model.traverse((child) => candidates.push(child));

      for (const child of candidates) {
         const n = child.name.toLowerCase();
         if (!bestNode && (n.includes("logs") || n.includes("campfire") || n.includes("wood"))) {
            bestNode = child;
         }
      }
      if (!bestNode) {
          for (const child of candidates) {
             const n = child.name.toLowerCase();
             if (!bestNode && (n.includes("fire") || n.includes("flame"))) {
                bestNode = child;
             }
          }
      }

      if (bestNode) {
          const b = new THREE.Box3().setFromObject(bestNode);
          targetCenter = b.getCenter(new THREE.Vector3());
      }

      model.position.x -= targetCenter.x;
      model.position.z -= targetCenter.z;
      const finalMinY = finalBox.min.y;
      model.position.y -= finalMinY; 
      model.position.y -= 2.0;
      
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          mixer!.clipAction(clip).play();
        });
      }

      root!.add(model);
    },
    undefined,
    (error: unknown) => {
      console.error("Erreur chargement GLB:", error);
    }
  );

  resize();
  window.addEventListener("resize", resize);

  // Position initiale
  if (props.isGameStarted) {
    moveCameraTo(props.activeIndex);
  }

  animate();
}

watch(() => props.isGameStarted, (started) => {
  if (controls && camera) {
    if (started) {
      controls.autoRotate = false;
      controls.enableZoom = true;
      controls.enablePan = false; // On garde false car screenSpacePanning est false, mais on veut peut-être autoriser la navigation normale définie par OrbitControls
      
      // On réactive les interactions normales
      controls.enableRotate = true;
      
      // Animation vers la vue par défaut ou l'item actif
      // Transition plus lente et fluide pour l'intro (4 secondes)
      moveCameraTo(props.activeIndex, 4.0, "power3.inOut", () => {
        emit("scene-entered");
      });
    } else {
      // Retour à l'état "Menu"
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableRotate = false;

      // Animation vers la position de menu (éloignée)
      gsap.to(camera.position, {
        x: 35,
        y: 15,
        z: 35,
        duration: 2.5,
        ease: "power2.inOut"
      });

      gsap.to(controls.target, {
        x: 0,
        y: 1,
        z: 0,
        duration: 2.5,
        ease: "power2.inOut"
      });
    }
  }
});

function animate() {
  if (!renderer || !scene || !camera) return;

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
  renderer?.dispose();
  controls?.dispose();
  renderer = null;
  scene = null;
  camera = null;
  controls = null;
  root = null;
}

watch(
  () => props.activeIndex,
  (idx) => {
    // Affiche le conseil seulement si aucun objet n'est sélectionné
    showTip.value = (idx === -1);
    moveCameraTo(idx);
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
