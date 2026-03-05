<template>
  <section
    ref="sectionRef"
    class="relative py-24 md:py-32 px-4"
    aria-label="Special thanks"
  >
    <div class="max-w-3xl mx-auto text-center">
      <!-- Section header -->
      <h2 ref="titleRef" class="font-display text-2xl md:text-4xl font-bold tracking-wider mb-4 opacity-0">
        <span class="text-light">REMERCIEMENTS </span>
        <span class="text-gold text-glow-gold">SPÉCIAUX</span>
      </h2>

      <!-- Animated divider -->
      <div ref="lineRef" class="mx-auto mt-4 mb-12 h-px w-0 opacity-0 overflow-hidden">
        <div class="h-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" style="width:128px" />
      </div>

      <!-- Thanks entries -->
      <div class="space-y-6">
        <p
          v-for="(entry, index) in specialThanks"
          :key="index"
          :ref="(el) => entryEls.push(el as HTMLElement)"
          class="font-body text-lg md:text-xl text-light/60 leading-relaxed opacity-0"
        >
          {{ entry }}
        </p>
      </div>

      <!-- Closing note -->
      <div ref="closingRef" class="mt-16 opacity-0">
        <p class="font-body text-muted/50 text-sm italic">
          "Ce monde existe parce que vous y avez cru."
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { specialThanks } from '@/data/credits-data'

gsap.registerPlugin(ScrollTrigger)

const sectionRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const lineRef = ref<HTMLElement | null>(null)
const entryEls = ref<HTMLElement[]>([])
const closingRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top 70%',
      once: true,
    },
  })

  // Title with split-word style
  tl.fromTo(titleRef.value, {
    opacity: 0,
    y: 50,
    scale: 0.9,
    filter: 'blur(8px)',
  }, {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    duration: 1.2,
    ease: 'power3.out',
  })

  // Gold line
  tl.to(lineRef.value, {
    width: 128,
    opacity: 1,
    duration: 1,
    ease: 'power3.inOut',
  }, '-=0.5')

  // Entries: typewriter-style reveal alternating from left/right
  tl.fromTo(entryEls.value, {
    opacity: 0,
    x: (i: number) => i % 2 === 0 ? -60 : 60,
    filter: 'blur(6px)',
  }, {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.25,
  }, '-=0.3')

  // Closing note with dramatic reveal
  tl.fromTo(closingRef.value, {
    opacity: 0,
    y: 30,
    letterSpacing: '0.5em',
  }, {
    opacity: 1,
    y: 0,
    letterSpacing: 'normal',
    duration: 1.5,
    ease: 'power3.out',
  }, '-=0.2')
})

onUnmounted(() => {
  ScrollTrigger.getAll().forEach(st => st.kill())
})
</script>
