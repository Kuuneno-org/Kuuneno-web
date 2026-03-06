<template>
  <section
    ref="sectionRef"
    class="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    role="banner"
    aria-label="Credits introduction"
    @mousemove="onMouseMove"
  >
    <!-- Parallax gradient orbs -->
    <div
      ref="orbCyanRef"
      class="absolute w-[600px] h-[600px] rounded-full opacity-0 blur-[120px] pointer-events-none"
      :style="{
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.3), transparent)',
        top: '10%',
        left: '20%',
      }"
    />
    <div
      ref="orbPurpleRef"
      class="absolute w-[400px] h-[400px] rounded-full opacity-0 blur-[100px] pointer-events-none"
      :style="{
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3), transparent)',
        bottom: '20%',
        right: '15%',
      }"
    />

    <!-- Main content -->
    <div class="relative z-10 text-center px-4">
      <!-- Logo -->
      <div ref="logoRef" class="mb-12 opacity-0 transform translate-y-8">
        <img :src="kuunenoLogo" alt="Kuuneno Logo" class="h-24 md:h-32 mx-auto drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
      </div>

      <!-- Subtitle above -->
      <p ref="subtitleAboveRef" class="font-body text-sm tracking-[0.4em] uppercase text-muted mb-8 opacity-0">
        Un voyage à travers la création
      </p>

      <!-- Main title with letter animation -->
      <h1 ref="titleRef" class="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight overflow-hidden">
        <span
          v-for="(letter, index) in titleLetters"
          :key="index"
          ref="letterRefs"
          class="inline-block opacity-0"
          :class="letter === ' ' ? 'w-3 md:w-5' : ''"
          :style="{
            color: highlightIndices.includes(index) ? '#f59e0b' : '#f1f5f9',
          }"
        >
          {{ letter === ' ' ? '\u00A0' : letter }}
        </span>
      </h1>

      <!-- Subtitle below -->
      <p ref="subtitleBelowRef" class="font-body text-lg md:text-xl text-muted/80 max-w-xl mx-auto leading-relaxed opacity-0">
        Rencontrez les esprits qui ont forgé cet univers à partir de rien d'autre que de la passion, du code et d'innombrables nuits blanches.
      </p>

      <!-- Decorative line -->
      <div ref="decoLineRef" class="mx-auto mt-10 h-px w-0 opacity-0 overflow-hidden">
        <div class="h-full w-full bg-gradient-to-r from-transparent via-glow to-transparent" style="width:128px" />
      </div>
    </div>

    <!-- Scroll indicator -->
    <div ref="scrollIndicatorRef" class="absolute bottom-10 flex flex-col items-center gap-3 opacity-0">
      <span class="font-body text-xs tracking-[0.3em] uppercase text-muted/60">Défilez pour explorer</span>
      <div class="w-6 h-10 rounded-full border border-glow/30 flex items-start justify-center p-1.5 backdrop-blur-sm">
        <div ref="scrollDotRef" class="w-1.5 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import gsap from 'gsap'
import kuunenoLogo from '@/assets/logo/kuuneno_logo.png'

const sectionRef = ref<HTMLElement | null>(null)
const logoRef = ref<HTMLElement | null>(null)
const orbCyanRef = ref<HTMLElement | null>(null)
const orbPurpleRef = ref<HTMLElement | null>(null)
const subtitleAboveRef = ref<HTMLElement | null>(null)
const subtitleBelowRef = ref<HTMLElement | null>(null)
const decoLineRef = ref<HTMLElement | null>(null)
const scrollIndicatorRef = ref<HTMLElement | null>(null)
const scrollDotRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const letterRefs = ref<HTMLElement[]>([])

const title = 'LES ESPRITS DERRIÈRE KUUNENOS'
const titleLetters = computed(() => title.split(''))

const highlightIndices = computed(() => {
  const indices: number[] = []
  const espritsStart = title.indexOf('LES ESPRITS')
  const worldStart = title.indexOf('KUUNENOS')
  for (let i = espritsStart; i < espritsStart + 11; i++) indices.push(i)
  for (let i = worldStart; i < worldStart + 8; i++) indices.push(i)
  return indices
})

function onMouseMove(e: MouseEvent) {
  if (!sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  const nx = (e.clientX - rect.width / 2) / rect.width
  const ny = (e.clientY - rect.height / 2) / rect.height
  gsap.to(orbCyanRef.value, { x: nx * 40, y: ny * 40, duration: 1.2, ease: 'power2.out' })
  gsap.to(orbPurpleRef.value, { x: nx * -30, y: ny * -30, duration: 1.2, ease: 'power2.out' })
}

onMounted(() => {
  const tl = gsap.timeline({ delay: 0.3 })

  // 1. Orbs fade in with scale from center
  tl.to([orbCyanRef.value, orbPurpleRef.value], {
    opacity: (i: number) => i === 0 ? 0.2 : 0.1,
    scale: 1,
    duration: 2,
    ease: 'power3.out',
    stagger: 0.3,
  })

  // 1.5 Logo Reveal
  if (logoRef.value) {
    tl.to(logoRef.value, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: 'power3.out',
    }, '-=1.8')
  }

  // 2. Subtitle above - text reveal with clip path
  tl.to(subtitleAboveRef.value, {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power3.out',
  }, '-=1.5')

  // 3. Letters - dramatic staggered drop with elastic bounce
  tl.fromTo(
    letterRefs.value.filter(el => el),
    {
      opacity: 0,
      y: 80,
      rotateX: -90,
      scale: 0.3,
      filter: 'blur(12px)',
    },
    {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.8,
      ease: 'back.out(1.7)',
      stagger: {
        each: 0.035,
        from: 'center',
      },
    },
    '-=0.6'
  )

  // 4. Highlight letters get a glow pulse after appearing
  const highlightLetters = letterRefs.value.filter((_, i) => highlightIndices.value.includes(i))
  tl.to(highlightLetters, {
    textShadow: '0 0 30px rgba(245, 158, 11, 0.8), 0 0 60px rgba(245, 158, 11, 0.4), 0 0 90px rgba(245, 158, 11, 0.2)',
    duration: 0.6,
    ease: 'power2.inOut',
    stagger: 0.05,
  }, '-=0.3')
  tl.to(highlightLetters, {
    textShadow: '0 0 20px rgba(245, 158, 11, 0.5), 0 0 40px rgba(245, 158, 11, 0.2)',
    duration: 0.8,
    ease: 'power2.out',
    stagger: 0.05,
  })

  // 5. Subtitle below
  tl.fromTo(subtitleBelowRef.value, {
    opacity: 0,
    y: 30,
    filter: 'blur(8px)',
  }, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 1.2,
    ease: 'power3.out',
  }, '-=1')

  // 6. Decorative line expands
  tl.to(decoLineRef.value, {
    width: 128,
    opacity: 1,
    duration: 1,
    ease: 'power3.inOut',
  }, '-=0.6')

  // 7. Scroll indicator
  tl.to(scrollIndicatorRef.value, {
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
  }, '-=0.3')

  // Continuous scroll dot bounce
  if (scrollDotRef.value) {
    gsap.fromTo(scrollDotRef.value, {
      y: 0,
      opacity: 1
    }, {
      y: 12,
      opacity: 0.5,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    })
  }

  // Continuous floating on orbs
  gsap.to(orbCyanRef.value, {
    y: '+=20',
    duration: 4,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })
  gsap.to(orbPurpleRef.value, {
    y: '-=15',
    duration: 5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })
})
</script>
