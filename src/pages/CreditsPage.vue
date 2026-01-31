<template>
    <div class="credits-page">
        <h1>Crédits</h1>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';

onMounted(() => {
    // Ajouter une animation de fondu d'entrée
    gsap.from('.credits-page', {
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut'
    });
});

onBeforeUnmount(() => {
    // Ajouter une animation de fondu de sortie
    gsap.to('.credits-page', {
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut'
    });
});
</script>

<style>
.credits-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    background-color: #000;
    color: #fff;
}
</style>