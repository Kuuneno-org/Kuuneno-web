<template>
  <div class="story-page">
    <GameTitleScreen />
  </div>
</template>

<script setup lang="ts">
import GameTitleScreen from "@/components/ui/GameTitleScreen.vue";
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
