<template>
  <div class="app-shell">
    <NightSky />
    <main class="app-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import NightSky from "@/components/home/NightSky.vue";
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}
.app-content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
}
</style>
