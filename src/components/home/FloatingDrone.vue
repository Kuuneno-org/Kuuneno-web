<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import droneUrl from '@/assets/3D/Objects/camera_drone.glb?url';

const props = defineProps<{
  scene: THREE.Scene;
}>();

let model: THREE.Group | null = null;
let mixer: THREE.AnimationMixer | null = null;
let rafId: number = 0;
const clock = new THREE.Clock();

// Variables pour le mouvement
let time = 0;
const centerPosition = new THREE.Vector3(0, 5, 0); // Centre du mouvement (au-dessus du feu)
const radius = 8; // Rayon du cercle/parcours
const speed = 0.5; // Vitesse de déplacement

onMounted(() => {
  const loader = new GLTFLoader();
  loader.load(droneUrl, (gltf) => {
    console.log("Drone loaded", gltf);
    model = gltf.scene;

    // Debug info
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    console.log("Drone size:", size);
    console.log("Drone center:", center);

    // Recentrer le modèle si nécessaire
    model.position.x -= center.x;
    model.position.y -= center.y;
    model.position.z -= center.z;
    
    // Le placer dans un groupe parent pour l'animation de déplacement
    const group = new THREE.Group();
    group.add(model);
    model = group; // On manipule le groupe maintenant

    // Configuration initiale
    // Ajuster l'échelle en fonction de la taille réelle
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
        const targetScale = 1.0; // Taille cible d'environ 2 unités
        const scale = targetScale / maxDim;
        model.scale.set(scale, scale, scale);
    } else {
        model.scale.set(1, 1, 1); // Fallback
    }

    // Ajout d'un helper pour visualiser la position si le modèle est invisible/trop petit
    const helper = new THREE.AxesHelper(5);
    model.add(helper);

    // DEBUG: Ajouter une sphère rouge visible pour repérer le drone de loin
    const debugGeo = new THREE.SphereGeometry(2, 32, 32);
    const debugMat = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    const debugMesh = new THREE.Mesh(debugGeo, debugMat);
    model.add(debugMesh);

    // Animation du modèle (hélices, etc.)
    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        const action = mixer!.clipAction(clip);
        action.play();
      });
    }

    props.scene.add(model);
    animate();
  });
});

const animate = () => {
  const delta = clock.getDelta();
  
  if (mixer) {
    mixer.update(delta);
  }

  if (model) {
    time += delta * speed;
    
    // Mouvement en "huit" ou cercle
    // x = sin(t) * radius
    // z = cos(t) * radius * 0.5 (pour faire une ellipse)
    // y = baseHeight + sin(t * 2) * verticalAmplitude
    
    const x = Math.sin(time) * radius;
    const z = Math.cos(time) * radius;
    const y = centerPosition.y + Math.sin(time * 2) * 1.0;

    // Position cible
    const targetPosition = new THREE.Vector3(x, y, z);
    
    // Lisser le déplacement
    model.position.lerp(targetPosition, 0.1);
    
    // Le drone regarde vers le centre (le feu de camp) ou vers sa direction de mouvement
    // Option 1: Regarde le centre (0, 0, 0)
    model.lookAt(0, 2, 0);
    
    // Option 2: Regarde vers l'avant (tangente au mouvement)
    // Pour l'instant, regarder le centre est plus "caméra de surveillance"
  }

  rafId = requestAnimationFrame(animate);
};

onBeforeUnmount(() => {
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
  if (model) {
    props.scene.remove(model);
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        } else if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        }
      }
    });
  }
});
</script>

<template>
  <slot />
</template>
