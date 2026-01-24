<template>
  <div class="story-page">
    <button class="back-btn" @click="$router.push('/')">← Retour</button>
    <!-- Le chemin doit être absolu depuis la racine du serveur, mais sans 'public' -->
    <!-- CheerpJ utilise un système de fichiers virtuel. /app/ correspond à la racine du serveur web -->
    <KuunenoGame jarPath="/app/games/Java-SnakeGame.jar" :width="800" :height="600" />
  </div>
</template>

<script setup lang="ts">
import KuunenoGame from "@/components/game/KuunenoGame.vue";
</script>

<style scoped>
.story-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
