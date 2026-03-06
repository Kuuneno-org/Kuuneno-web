<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const gamepadUrl = '/3D/Objects/gamepad.glb';
const plumbobUrl = '/3D/Objects/plumbob.glb';

const props = defineProps<{
  scene: THREE.Scene;
}>();

let model: THREE.Group | null = null;
let plumbobModel: THREE.Group | null = null;
let mixer: THREE.AnimationMixer | null = null;
let rafId: number = 0;
const clock = new THREE.Clock();

onMounted(() => {
  const loader = new GLTFLoader();
  loader.load(gamepadUrl, (gltf) => {
    model = gltf.scene;

    // Configuration du modèle
    // Positionnement dans la tente
    // Paramètres de positionnement (x, y, z) en unités de monde
    // x: 10  -> légèrement à droite du centre du feu de camp
    // y: 0.5 -> juste au-dessus du niveau de la Terre
    // z: 5  -> légèrement vers l'avant du centre du feu de camp
    model.position.set(0, 0.80, 0);

    // Rotation : posé au sol ou sur un sac de couchage
    // y: 0 -> face vers le haut
    // x: 20 -> légèrement vers la gauche
    // z: 0 -> face vers l'avant
    model.rotation.set(80, 0, 20);

    // Échelle arbitraire
    model.scale.set(0.2, 0.2, 0.2);

    // Animation interne du GLB
    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }

    // Ajout à la scène globale
    props.scene.add(model);

    // Chargement du Plumbob
    loader.load(plumbobUrl, (gltfPlumbob) => {
      plumbobModel = gltfPlumbob.scene;
      
      // Position au-dessus du gamepad (Gamepad est à 0, 0.80, 0)
      plumbobModel.position.set(0, 1, 0);
      
      // Échelle
      plumbobModel.scale.set(0.2, 0.2, 0.2);
      
      // Effet de glow (emissive)
      plumbobModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material) {
            // Assurons-nous que le matériau gère l'emissive
            if ('emissive' in child.material) {
              (child.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x00ff00); // Vert Sims
              (child.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8;
            }
          }
        }
      });
      
      props.scene.add(plumbobModel);
    });

    // Démarrage de la boucle d'animation locale
    animate();
  });
});

function animate() {
  const delta = clock.getDelta();
  if (mixer) {
    mixer.update(delta);
  }
  // Rotation permanente du Plumbob
  if (plumbobModel) {
    plumbobModel.rotation.y += 0.02;
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

  if (plumbobModel) {
    props.scene.remove(plumbobModel);
    plumbobModel.traverse((child) => {
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
