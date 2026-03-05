<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import creditsUrl from '@/assets/3D/Objects/altar.glb?url';
import plumbobUrl from '@/assets/3D/Objects/plumbob.glb?url';

const props = defineProps<{
  scene: THREE.Scene;
}>();

let model: THREE.Group | null = null;
let plumbobModel: THREE.Group | null = null;
let mixer: THREE.AnimationMixer | null = null;
let action: THREE.AnimationAction | null = null;
let rafId: number = 0;
const clock = new THREE.Clock();

onMounted(() => {
  const loader = new GLTFLoader();
  loader.load(creditsUrl, (gltf) => {
    model = gltf.scene;

    // Configuration du modèle
    // Positionnement à droite du camping (axe X positif)
    // Paramètres de positionnement (x, y, z) en unités de monde
    // x: -3  -> à gauche
    // y: 0.9 -> hauteur
    // z: 10  -> fond
    model.position.set(-9, 0.9, 6);

    // Orientation : Regarde vers le feu (0, 0, 0)
    model.lookAt(0, 0.5, 0);
    // Si le modèle est orienté à l'envers (dos au feu), décommenter la ligne suivante :
    // model.rotateY(Math.PI);

    // Échelle arbitraire
    model.scale.set(0.15, 0.15, 0.15);

    // Animation interne du GLB
    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }

    // Ajout à la scène globale
    props.scene.add(model);

    // Chargement du Plumbob
    loader.load(plumbobUrl, (gltfPlumbob) => {
      plumbobModel = gltfPlumbob.scene;
      
      // Position au-dessus de l'autel (Altar est à -9, 0.9, 6)
      // On le met un peu plus haut : y = 3
      plumbobModel.position.set(-9, 3, 6);
      
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
