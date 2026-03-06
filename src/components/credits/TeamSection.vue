<template>
  <section
    ref="sectionRef"
    class="relative py-24 md:py-32 px-4"
    aria-label="Core team members"
  >
    <!-- Section header -->
    <div ref="headerRef" class="max-w-6xl mx-auto mb-16 text-center">
      <h2
        ref="titleRef"
        class="font-display text-2xl md:text-4xl font-bold tracking-wider mb-4 opacity-0"
      >
        <span class="text-light">ÉQUIPE </span>
        <span class="text-glow">PRINCIPALE</span>
      </h2>
      <p ref="descRef" class="font-body text-muted/70 max-w-md mx-auto leading-relaxed opacity-0">
        Huit visionnaires qui ont mis leur âme à construire ce monde.
      </p>
      <div ref="lineRef" class="mx-auto mt-6 h-px w-0 opacity-0 overflow-hidden">
        <div class="h-full bg-gradient-to-r from-transparent via-glow/40 to-transparent" style="width:96px" />
      </div>
    </div>

    <!-- Team grid -->
    <div ref="gridRef" class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <TeamCard
        v-for="(member, index) in teamMembers"
        :key="member.id"
        :member="member"
        :index="index"
        @select="$emit('selectMember', $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TeamCard from './TeamCard.vue'
import { teamMembers } from '@/data/credits-data'

gsap.registerPlugin(ScrollTrigger)

defineEmits<{
  selectMember: [member: (typeof teamMembers)[0]]
}>()

const sectionRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const descRef = ref<HTMLElement | null>(null)
const lineRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)

onMounted(() => {
  // Header animation triggered on scroll
  const headerTl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top 75%',
      once: true,
    },
  })

  headerTl.fromTo(titleRef.value, {
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

  headerTl.fromTo(descRef.value, {
    opacity: 0,
    y: 25,
  }, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
  }, '-=0.5')

  headerTl.to(lineRef.value, {
    width: 96,
    opacity: 1,
    duration: 0.8,
    ease: 'power3.inOut',
  }, '-=0.3')

  // Cards staggered entrance - dramatic
  if (gridRef.value) {
    const cards = gridRef.value.children
    headerTl.fromTo(cards, {
      opacity: 0,
      y: 60,
      scale: 0.8,
      rotateY: -15,
      filter: 'blur(6px)',
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateY: 0,
      filter: 'blur(0px)',
      duration: 0.9,
      ease: 'back.out(1.4)',
      stagger: {
        each: 0.12,
        from: 'start',
        grid: 'auto',
        axis: 'x',
      },
    }, '-=0.2')
  }
})

onUnmounted(() => {
  ScrollTrigger.getAll().forEach(st => st.kill())
})
</script>
