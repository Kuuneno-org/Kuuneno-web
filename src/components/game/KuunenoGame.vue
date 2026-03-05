<script setup lang="ts">
import { onMounted, ref } from 'vue';

/**
 * Composant Vue pour lancer l'application Java Swing via CheerpJ.
 *
 * Le composant charge le fichier .jar fourni et l'exécute dans un environnement virtuel WebAssembly.
 * Le fichier .jar est accessible via le chemin relatif fourni.
 *
 * @param jarPath Chemin vers le fichier .jar ("/games/nomDuJeu.jar"),
 * @param width Largeur de l'affichage (par défaut 800)
 * @param height Hauteur de l'affichage (par défaut 600)
 */
const props = defineProps<{
  jarPath: string; // Chemin vers le fichier .jar ("/games/nomDuJeu.jar"),
  width?: number;
  height?: number;
}>();

const loading = ref(true);
const error = ref<string | null>(null);
interface CheerpJWindow extends Window {
  cheerpjInit: () => Promise<void>;
  cheerpjCreateDisplay: (width: number, height: number, container: HTMLElement | null) => void;
  cheerpjRunJar: (jarPath: string, args: string) => void;
}

const win = window as unknown as CheerpJWindow;

onMounted(async () => {
  try {
    console.log("Initialisation de CheerpJ...");

    // Vérification que le script est bien chargé
    if (!win.cheerpjInit) {
        throw new Error("CheerpJ n'est pas chargé. Le CDN de CheerpJ doit être inclus dans index.html");
    }

    // Initialisation du runtime CheerpJ
    await win.cheerpjInit();

    // On crée l'affichage graphique AVANT de lancer le JAR
    // On cible l'ID de notre conteneur cheerpj-container
    win.cheerpjCreateDisplay(props.width || 800, props.height || 600, document.getElementById('cheerpj-container'));

    console.log(`Lancement du JAR : ${props.jarPath}`);

    // On lance l'application Java
    // On n'attend PAS la fin de l'exécution car c'est une boucle infinie (le jeu)
    win.cheerpjRunJar(props.jarPath, "");

    // On masque le loader après un court délai pour laisser le temps à l'UI Swing de s'initialiser
    setTimeout(() => {
      loading.value = false;
    }, 1500);
  } catch (e: unknown) {
    console.error("Erreur CheerpJ:", e);
    error.value = (e instanceof Error ? e.message : String(e)) || "Erreur lors du lancement du jeu Java";
    loading.value = false;
  }
});
</script>

<template>
  <div class="game-wrapper">
    <!-- Feedback de chargement -->
    <div v-if="loading" class="status-message loading">
      <div class="spinner"></div>
      <p>Démarrage du moteur Java en WebAssembly...</p>
    </div>

    <div v-if="error" class="status-message error">
      <p>⚠️ {{ error }}</p>
    </div>

    <!-- CheerpJ va créer son l'affichage en overlay ou dans le DOM.
         On prévoie ce conteneur pour gérer l'espace. -->
    <div id="cheerpj-container" :style="{ width: width + 'px', height: height + 'px' }"></div>
  </div>
</template>

<style scoped>
.game-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
  min-height: 600px;
}

.status-message {
  position: absolute;
  z-index: 10;
  color: white;
  text-align: center;
  font-family: sans-serif;
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 8px;
}

.error {
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid #fff;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>