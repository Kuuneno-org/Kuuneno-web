<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const gamepadUrl = '/3D/Objects/altar_of_summoning.glb';

const props = defineProps<{
  scene: THREE.Scene;
}>();

let model: THREE.Group | null = null;
let mixer: THREE.AnimationMixer | null = null;
let rafId: number = 0;
let light: THREE.PointLight | null = null;
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
    model.position.set(5, 0.6, 10);

    // Rotation : posé au sol ou sur un sac de couchage
    // y: 0 -> face vers le haut
    // x: 20 -> légèrement vers la gauche
    // z: 0 -> face vers l'avant
    model.rotation.set(0, 0, 0);

    // Échelle arbitraire
    model.scale.set(1.3, 1.3, 1.3);

    // Ajout d'une lumière ambiante au-dessus de la table
    // Lumière chaude et douce (orange/jaune) provenant du feu (0,0,0)
    // On positionne la lumière par rapport à la table pour simuler l'éclairage du feu
    // Le feu est à (0,0,0), la table est à (5, 0.5, 10)
    // La lumière doit venir de la direction du feu
    light = new THREE.PointLight(0xff4500, 3, 20); // Couleur feu plus intense (rouge-orange)
    // Position relative : le feu est à (-5, -0.5, -10) par rapport à la table
    light.position.set(-5, 0.5, -10);
    model.add(light);

    // Animation interne du GLB
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
    if (light) {
      model.remove(light);
      light.dispose();
    }
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
