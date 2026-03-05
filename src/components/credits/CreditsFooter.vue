<template>
  <footer
    ref="footerRef"
    class="relative py-16 px-4 border-t border-glow/5"
    aria-label="Credits footer"
  >
    <div class="max-w-4xl mx-auto text-center">
      <!-- Logo / Title -->
      <div ref="logoRef" class="mb-6 opacity-0">
        <h3 class="font-display text-xl font-bold tracking-[0.2em] text-glow text-glow-subtle">
          NEXUS WORLDS
        </h3>
      </div>

      <!-- Description -->
      <p ref="descRef" class="font-body text-sm text-muted/50 max-w-sm mx-auto leading-relaxed mb-8 opacity-0">
        Conçu avec passion par une équipe qui ose rêver. Chaque ligne de code, chaque pixel, chaque note a été placé avec intention.
      </p>

      <!-- Divider -->
      <div ref="lineRef" class="mx-auto mb-8 h-px w-0 opacity-0 overflow-hidden">
        <div class="h-full bg-gradient-to-r from-transparent via-glow/20 to-transparent" style="width:64px" />
      </div>

      <!-- Copyright -->
      <p ref="copyrightRef" class="font-body text-xs text-muted/30 opacity-0">
        {{ currentYear }} Nexus Worlds Studio. Tous droits réservés.
      </p>

      <!-- Back to top -->
      <button
        ref="backToTopRef"
        class="mt-8 inline-flex items-center gap-2 px-4 py-2 text-xs font-body tracking-wider uppercase text-muted/40 rounded-full border border-transparent opacity-0"
        @click="scrollToTop"
        @mouseenter="onBtnEnter"
        @mouseleave="onBtnLeave"
        aria-label="Scroll back to top"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
        Retour en haut
      </button>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const footerRef = ref<HTMLElement | null>(null)
const logoRef = ref<HTMLElement | null>(null)
const descRef = ref<HTMLElement | null>(null)
const lineRef = ref<HTMLElement | null>(null)
const copyrightRef = ref<HTMLElement | null>(null)
const backToTopRef = ref<HTMLElement | null>(null)

const currentYear = new Date().getFullYear()

function scrollToTop() {
  // Rocket animation on button
  gsap.to(backToTopRef.value, {
    y: -20,
    opacity: 0,
    duration: 0.3,
    ease: 'power2.in',
    onComplete: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      gsap.set(backToTopRef.value, { y: 0, opacity: 1 })
    },
  })
}

function onBtnEnter() {
  gsap.to(backToTopRef.value, {
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    scale: 1.05,
    duration: 0.3,
    ease: 'power2.out',
  })
}

function onBtnLeave() {
  gsap.to(backToTopRef.value, {
    color: 'rgba(148, 163, 184, 0.4)',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    scale: 1,
    duration: 0.3,
    ease: 'power2.out',
  })
}

onMounted(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: footerRef.value,
      start: 'top 85%',
      once: true,
    },
  })

  // Logo pulses in
  tl.fromTo(logoRef.value, {
    opacity: 0,
    scale: 0.7,
    filter: 'blur(8px)',
  }, {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    duration: 0.8,
    ease: 'back.out(1.5)',
  })

  // Description
  tl.fromTo(descRef.value, {
    opacity: 0,
    y: 20,
  }, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
  }, '-=0.3')

  // Line
  tl.to(lineRef.value, {
    width: 64,
    opacity: 1,
    duration: 0.6,
    ease: 'power3.inOut',
  }, '-=0.2')

  // Copyright
  tl.fromTo(copyrightRef.value, {
    opacity: 0,
  }, {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.out',
  }, '-=0.2')

  // Back to top button
  tl.fromTo(backToTopRef.value, {
    opacity: 0,
    y: 15,
  }, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'power3.out',
  }, '-=0.2')
})

onUnmounted(() => {
  ScrollTrigger.getAll().forEach(st => st.kill())
})
</script>
