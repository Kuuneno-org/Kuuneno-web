<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import ghostMaskUrl from '@/assets/3D/Objects/ghost-mask.glb?url';

const props = defineProps<{
  scene: THREE.Scene;
  camera: THREE.Camera;
}>();

let model: THREE.Group | null = null;
let mixer: THREE.AnimationMixer | null = null;
let rafId: number = 0;
const clock = new THREE.Clock();

onMounted(() => {
  const loader = new GLTFLoader();
  loader.load(ghostMaskUrl, (gltf) => {
    model = gltf.scene;

    // Configuration du modèle
    // Positionnement dans la scène, un peu éloigné du centre (camping)
    // La caméra est à (20, 12, 8) et regarde vers (5, 1.5, 0)
    // On le place en arrière plan, légèrement en hauteur
    // x: 10  -> légèrement à droite du centre du feu de camp
    // y: 0.4 -> juste au-dessus du niveau de la Terre
    // z: 5  -> légèrement vers l'avant du centre du feu de camp
    model.position.set(-8, 3, -10); 
    
    // On le fait regarder vers la caméra pour qu'il soit "en face"
    model.lookAt(props.camera.position);
    
    // Échelle arbitraire
    model.scale.set(1, 1, 1);

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
  // Petit mouvement de flottement
  if (model) {
     model.position.y += Math.sin(clock.getElapsedTime()) * 0.002;
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
