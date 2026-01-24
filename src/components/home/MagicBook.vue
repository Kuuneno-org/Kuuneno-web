<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import bookUrl from '@/assets/3D/Objects/book.glb?url';

const props = defineProps<{
  scene: THREE.Scene;
}>();

let model: THREE.Group | null = null;
let mixer: THREE.AnimationMixer | null = null;
let rafId: number = 0;
const clock = new THREE.Clock();

onMounted(() => {
  const loader = new GLTFLoader();
  loader.load(bookUrl, (gltf) => {
    model = gltf.scene;

    // Configuration du modèle
    // Positionnement au niveau du feu de camp (centre 0,0,0)
    // On le place juste à côté pour ne pas être dans les flammes
    // Paramètres de positionnement (x, y, z) en unités de monde
    // x: 10  -> légèrement à droite du centre du feu de camp
    // y: 0.5 -> juste au-dessus du niveau de la Terre
    // z: 5  -> légèrement vers l'avant du centre du feu de camp
    model.position.set(10, 0.5, 5);

    // Rotation : orienté vers le feu ou vers l'extérieur, posé de manière naturelle
    // y: 0 -> face vers le haut
    // x: 20 -> légèrement vers la gauche
    // z: 0 -> face vers l'avant
    model.rotation.set(0, 20, 0);

    // Échelle arbitraire
    model.scale.set(2, 2, 2);

    // Animation
    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(gltf.animations[0]);
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
  if (mixer) {
    mixer.update(delta);
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
