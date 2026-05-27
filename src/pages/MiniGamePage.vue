<template>
  <div class="page">
    <button class="back" @click="$router.push('/')">← Retour</button>
    <WebBuildFrame src="/mini-jeu/index.html" />
  </div>
</template>

<script setup lang="ts">
import WebBuildFrame from "@/components/minigame/WebBuildFrame.vue";
</script>

<style scoped>
.page {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
}
.back {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
}
.back:hover {
  background: rgba(255, 255, 255, 0.14);
}
</style>
