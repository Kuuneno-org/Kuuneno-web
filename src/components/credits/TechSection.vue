<template>
  <section
    ref="sectionRef"
    class="relative py-24 md:py-32 px-4"
    aria-label="Technologies used"
  >
    <div class="max-w-5xl mx-auto">
      <!-- Section header -->
      <div class="text-center mb-16">
        <h2 ref="titleRef" class="font-display text-2xl md:text-4xl font-bold tracking-wider mb-4 opacity-0">
          <span class="text-light">FORGÉ </span>
          <span class="text-glow">AVEC</span>
        </h2>
        <p ref="descRef" class="font-body text-muted/70 max-w-md mx-auto leading-relaxed opacity-0">
          Les technologies et outils qui propulsent ce monde.
        </p>
        <div ref="lineRef" class="mx-auto mt-6 h-px w-0 opacity-0 overflow-hidden">
          <div class="h-full bg-gradient-to-r from-transparent via-glow/40 to-transparent" style="width:96px" />
        </div>
      </div>

      <!-- Tech categories -->
      <div class="space-y-10">
        <div
          v-for="(techs, category) in technologies"
          :key="category"
          :ref="(el) => categoryEls.push(el as HTMLElement)"
          class="opacity-0"
        >
          <h3 class="font-display text-xs tracking-[0.3em] uppercase text-muted/60 mb-4 text-center">
            {{ category }}
          </h3>
          <div class="flex flex-wrap justify-center gap-3">
            <span
              v-for="tech in techs"
              :key="tech"
              :ref="(el) => pillEls.push(el as HTMLElement)"
              class="tech-pill px-5 py-2.5 font-body text-sm rounded-full glass border border-glow/10 text-light/80 cursor-default select-none"
            >
              {{ tech }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { technologies } from '@/data/credits-data'

gsap.registerPlugin(ScrollTrigger)

const sectionRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const descRef = ref<HTMLElement | null>(null)
const lineRef = ref<HTMLElement | null>(null)
const categoryEls = ref<HTMLElement[]>([])
const pillEls = ref<HTMLElement[]>([])

onMounted(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top 75%',
      once: true,
    },
  })

  // Header
  tl.fromTo(titleRef.value, {
    opacity: 0,
    y: 40,
    filter: 'blur(10px)',
  }, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 1,
    ease: 'power3.out',
  })

  tl.fromTo(descRef.value, {
    opacity: 0,
    y: 20,
  }, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
  }, '-=0.5')

  tl.to(lineRef.value, {
    width: 96,
    opacity: 1,
    duration: 0.8,
    ease: 'power3.inOut',
  }, '-=0.3')

  // Categories stagger
  tl.fromTo(categoryEls.value, {
    opacity: 0,
    y: 30,
  }, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.2,
  }, '-=0.2')

  // Pills scatter in from random positions
  tl.fromTo(pillEls.value, {
    opacity: 0,
    scale: 0,
    rotation: () => gsap.utils.random(-20, 20),
  }, {
    opacity: 1,
    scale: 1,
    rotation: 0,
    duration: 0.6,
    ease: 'back.out(2)',
    stagger: {
      each: 0.05,
      from: 'random',
    },
  }, '-=0.4')

  // Continuous gentle floating on pills
  pillEls.value.forEach((pill, i) => {
    gsap.to(pill, {
      y: gsap.utils.random(-6, 6),
      duration: gsap.utils.random(3, 5),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.15,
    })

    // Hover effect via event listeners
    pill.addEventListener('mouseenter', () => {
      gsap.to(pill, {
        color: '#f59e0b',
        borderColor: 'rgba(245, 158, 11, 0.4)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)',
        scale: 1.08,
        duration: 0.3,
        ease: 'power2.out',
      })
    })
    pill.addEventListener('mouseleave', () => {
      gsap.to(pill, {
        color: 'rgba(148, 163, 184, 0.8)',
        borderColor: 'rgba(245, 158, 11, 0.1)',
        backgroundColor: 'rgba(13,18,37,0.8)',
        boxShadow: 'none',
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    })
  })
})

onUnmounted(() => {
  ScrollTrigger.getAll().forEach(st => st.kill())
})
</script>
