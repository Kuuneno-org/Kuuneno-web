<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import ghostMaskUrl from '@/assets/3D/Objects/ghost-mask.glb?url';
import plumbobUrl from '@/assets/3D/Objects/plumbob.glb?url';

const props = defineProps<{
  scene: THREE.Scene;
  camera: THREE.Camera;
  active?: boolean;
}>();

let model: THREE.Group | null = null;
let plumbobModel: THREE.Group | null = null;
let mixer: THREE.AnimationMixer | null = null;
let rafId: number = 0;
let rotationInterval: ReturnType<typeof setInterval> | null = null;
const clock = new THREE.Clock();

watch(() => props.active, (isActive) => {
  if (isActive && model) {
    // Attendre que la caméra arrive (environ 1.5s)
    setTimeout(() => {
      // Rotation de 3 tours (3 * 360°)
      gsap.to(model!.rotation, {
        y: model!.rotation.y + Math.PI * 2 * 3,
        duration: 3, // 1 tour par seconde
        ease: "power2.inOut"
      });
    }, 1500);
  }
});

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
    model.position.set(5, 3, -10);

    // On le fait regarder vers la caméra pour qu'il soit "en face"
    model.lookAt(props.camera.position);

    // Échelle arbitraire
    model.scale.set(0.5, 0.5, 0.5);

    // Animation
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
      
      // Position au-dessus du masque (Mask est à 5, 3, -10)
      plumbobModel.position.set(5, 5, -10);
      
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

    // Rotation périodique toutes les 20s
    rotationInterval = setInterval(() => {
      if (model) {
        // Rotation rapide sur 360 degrés (2 * PI)
        gsap.to(model.rotation, {
          y: model.rotation.y + Math.PI * 2,
          duration: 1, // Rapide (1 seconde)
          ease: "power2.inOut"
        });
      }
    }, 20000);
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
  // Rotation permanente du Plumbob
  if (plumbobModel) {
    plumbobModel.rotation.y += 0.02;
  }
  rafId = requestAnimationFrame(animate);
}

onBeforeUnmount(() => {
  if (rotationInterval) clearInterval(rotationInterval);
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
