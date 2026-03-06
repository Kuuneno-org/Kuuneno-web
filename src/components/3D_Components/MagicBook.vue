<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const bookUrl = '/3D/Objects/book.glb';
const plumbobUrl = '/3D/Objects/plumbob.glb';

const props = defineProps<{
  scene: THREE.Scene;
  active?: boolean;
}>();

let model: THREE.Group | null = null;
let plumbobModel: THREE.Group | null = null;
let mixer: THREE.AnimationMixer | null = null;
let action: THREE.AnimationAction | null = null;
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
    model.scale.set(1.5, 1.5, 1.5);

    // Animation
    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      action = mixer.clipAction(gltf.animations[0]);
      action.loop = THREE.LoopOnce; // Jouer une seule fois (ouverture)
      action.clampWhenFinished = true; // Rester à la fin de l'animation

      if (props.active) {
        action.play();
      }
    }

    // Ajout à la scène globale
    props.scene.add(model);

    // Chargement du Plumbob
    loader.load(plumbobUrl, (gltfPlumbob) => {
      plumbobModel = gltfPlumbob.scene;

      // Position au-dessus du livre (Book est à 10, 0.5, 5)
      plumbobModel.position.set(10, 1.5, 5);

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

watch(() => props.active, (isActive) => {
  if (action) {
    if (isActive) {
      // Attendre 3s avant de lancer l'animation (le temps que la caméra arrive)
      setTimeout(() => {
        if (props.active && action) { // Vérifier si toujours actif
          action.reset();
          action.play();
        }
      }, 1000); // 2000ms car la caméra met 1.5s à arriver
    } else {
      // On arrête l'animation pour revenir à l'état fermé
      action.stop();
    }
  }
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
