<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import moonUrl from '@/assets/3D/Objects/moon.glb?url';

const props = defineProps<{
  scene: THREE.Scene;
}>();

let model: THREE.Group | null = null;
let mixer: THREE.AnimationMixer | null = null;
let action: THREE.AnimationAction | null = null;
let rafId: number = 0;
const clock = new THREE.Clock();

onMounted(() => {
  const loader = new GLTFLoader();
  loader.load(moonUrl, (gltf) => {
    model = gltf.scene;

    // Positionnement de la lune dans le ciel
    // On la place loin derrière et en hauteur, hors du brouillard
    model.position.set(-50, 40, -50);

    // Rotation initiale
    model.rotation.set(0, 0, 0);

    // Échelle (la lune doit être très grande car elle est loin)
    model.scale.set(15, 15, 15);

    // Désactiver le brouillard sur la lune pour qu'elle reste visible au loin
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          // On clone le matériau pour ne pas affecter d'autres objets si partagé
          child.material = child.material.clone();
          child.material.fog = false;
          // Optionnel : augmenter l'émissivité si nécessaire
          if (child.material instanceof THREE.MeshStandardMaterial) {
             child.material.emissiveIntensity = 2.0;
          }
        }
      }
    });

    // Animation interne du GLB si existante
    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }

    // Ajout à la scène globale
    props.scene.add(model);

    // Démarrage de la boucle d'animation locale
    animate();
  });
});

function animate() {
  const delta = clock.getDelta();
  
  // Animation interne
  if (mixer) {
    mixer.update(delta);
  }

  // Rotation douce permanente si pas d'animation interne ou en plus
  if (model) {
    model.rotation.y += 0.001;
  }

  rafId = requestAnimationFrame(animate);
}

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId);
  if (model) {
    props.scene.remove(model);
    
    // Nettoyage basique
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
  }
});
</script>

<template>
  <!-- Ce composant n'a pas de rendu DOM propre, il manipule la scène Three.js -->
  <div style="display: none;"></div>
</template>
