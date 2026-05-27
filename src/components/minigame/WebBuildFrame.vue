<template>
  <div class="wrap">
    <div v-if="error" class="message">
      Mini‑jeu introuvable. Placez le build web dans public/mini-jeu.
    </div>
    <iframe
      v-else
      class="frame"
      :src="frameSrc"
      @load="onLoad"
      allow="autoplay; fullscreen; gamepad; xr-spatial-tracking; accelerometer; gyroscope; magnetometer; midi; clipboard-read; clipboard-write"
      allowfullscreen
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
const props = defineProps<{ src?: string }>();
const frameSrc = props.src ?? "/mini-jeu/index.html";
const loaded = ref(false);
const error = ref(false);
function onLoad() {
  loaded.value = true;
}
onMounted(async () => {
  try {
    const r = await fetch(frameSrc, { cache: "no-store" });
    if (!r.ok) error.value = true;
  } catch {
    error.value = true;
  }
});
</script>

<style scoped>
.wrap {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.frame {
  width: 100%;
  height: 100%;
  border: 0;
  background: #000;
}
.message {
  color: #fff;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji";
  opacity: 0.8;
}
</style>
