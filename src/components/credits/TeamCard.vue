<template>
  <div
    ref="cardRef"
    class="relative group cursor-pointer opacity-0"
    :style="{ perspective: '1000px' }"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @mouseenter="onMouseEnter"
    @click="onClick"
    role="button"
    :aria-label="`View details for ${member.name}, ${member.role}`"
    tabindex="0"
    @keydown.enter="onClick"
  >
    <div
      ref="innerRef"
      class="relative glass rounded-2xl p-6 overflow-hidden reflection-sweep"
      :style="{
        transformStyle: 'preserve-3d',
        boxShadow: '0 0 20px rgba(245, 158, 11, 0.08)',
      }"
    >
      <!-- Glow border on hover -->
      <div
        ref="glowBorderRef"
        class="absolute inset-0 rounded-2xl opacity-0 pointer-events-none"
        style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.15)); z-index: 0;"
      />

      <!-- Magnetic glow follow cursor -->
      <div
        ref="magneticGlowRef"
        class="absolute w-40 h-40 rounded-full opacity-0 pointer-events-none"
        style="background: radial-gradient(circle, rgba(245, 158, 11, 0.15), transparent 70%); transform: translate(-50%, -50%); z-index: 0;"
      />

      <div class="relative z-10">
        <!-- Avatar -->
        <div class="flex justify-center mb-4">
          <div class="relative">
            <div
              ref="avatarRingRef"
              class="w-20 h-20 rounded-full overflow-hidden border-2 border-glow/20"
            >
              <img
                :src="member.avatar"
                :alt="`Avatar of ${member.name}`"
                class="w-full h-full object-cover"
                loading="lazy"
                crossorigin="anonymous"
              />
            </div>
            <div ref="onlineDotRef" class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-glow/80 border-2 border-void scale-0" />
          </div>
        </div>

        <!-- Name -->
        <h3 ref="nameRef" class="font-display text-base text-center font-semibold text-light tracking-wider mb-1">
          {{ member.name }}
        </h3>

        <!-- Role -->
        <p ref="roleRef" class="font-body text-sm text-center text-muted mb-3">{{ member.role }}</p>

        <!-- Badge -->
        <div class="flex justify-center">
          <span
            ref="badgeRef"
            class="px-3 py-1 text-xs font-body font-medium tracking-wider uppercase rounded-full bg-glow/5 text-glow/60 border border-glow/10"
          >
            {{ member.badge }}
          </span>
        </div>
      </div>

      <!-- Rare sparkle effect -->
      <div
        v-if="showRareEffect"
        class="absolute inset-0 pointer-events-none z-20 rounded-2xl overflow-hidden"
      >
        <div
          v-for="i in 8"
          :key="i"
          :ref="(el) => sparkleEls.push(el as HTMLElement)"
          class="absolute w-1 h-1 bg-gold rounded-full opacity-0"
          :style="{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            boxShadow: '0 0 10px rgba(255,213,79,0.6)',
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import gsap from 'gsap'
import type { TeamMember } from '@/data/credits-data'

const props = defineProps<{
  member: TeamMember
  index: number
}>()

const emit = defineEmits<{
  select: [member: TeamMember]
}>()

const cardRef = ref<HTMLElement | null>(null)
const innerRef = ref<HTMLElement | null>(null)
const glowBorderRef = ref<HTMLElement | null>(null)
const magneticGlowRef = ref<HTMLElement | null>(null)
const avatarRingRef = ref<HTMLElement | null>(null)
const onlineDotRef = ref<HTMLElement | null>(null)
const nameRef = ref<HTMLElement | null>(null)
const roleRef = ref<HTMLElement | null>(null)
const badgeRef = ref<HTMLElement | null>(null)
const showRareEffect = ref(false)
const sparkleEls = ref<HTMLElement[]>([])

let floatTween: gsap.core.Tween | null = null

function onMouseMove(e: MouseEvent) {
  if (!cardRef.value || !innerRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height

  gsap.to(innerRef.value, {
    rotateY: (x - 0.5) * 20,
    rotateX: (y - 0.5) * -20,
    duration: 0.4,
    ease: 'power2.out',
  })

  // Magnetic glow follows cursor
  gsap.to(magneticGlowRef.value, {
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    opacity: 0.8,
    duration: 0.3,
    ease: 'power2.out',
  })

  // Rare sparkle trigger
  if (Math.random() < 0.003) {
    triggerSparkle()
  }
}

function onMouseEnter() {
  if (floatTween) floatTween.pause()

  gsap.to(innerRef.value, {
    scale: 1.05,
    boxShadow: '0 0 50px rgba(245, 158, 11, 0.3), 0 0 100px rgba(245, 158, 11, 0.1), inset 0 0 30px rgba(245, 158, 11, 0.03)',
    duration: 0.5,
    ease: 'power3.out',
  })
  gsap.to(glowBorderRef.value, { opacity: 1, duration: 0.4, ease: 'power2.out' })
  gsap.to(avatarRingRef.value, {
    borderColor: '#f59e0b',
    boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)',
    duration: 0.4,
    ease: 'power2.out',
  })
  gsap.to(badgeRef.value, {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    duration: 0.3,
  })
}

function onMouseLeave() {
  gsap.to(innerRef.value, {
    rotateY: 0,
    rotateX: 0,
    scale: 1,
    boxShadow: '0 0 20px rgba(245, 158, 11, 0.08)',
    duration: 0.6,
    ease: 'elastic.out(1, 0.4)',
  })
  gsap.to(glowBorderRef.value, { opacity: 0, duration: 0.4 })
  gsap.to(magneticGlowRef.value, { opacity: 0, duration: 0.4 })
  gsap.to(avatarRingRef.value, {
    borderColor: 'rgba(245, 158, 11, 0.2)',
    boxShadow: 'none',
    duration: 0.4,
  })
  gsap.to(badgeRef.value, {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    color: 'rgba(245, 158, 11, 0.6)',
    borderColor: 'rgba(245, 158, 11, 0.1)',
    duration: 0.3,
  })

  if (floatTween) floatTween.resume()
}

function onClick() {
  // Dramatic click pulse
  const tl = gsap.timeline()
  tl.to(innerRef.value, {
    scale: 0.95,
    boxShadow: '0 0 60px rgba(245, 158, 11, 0.6), 0 0 120px rgba(245, 158, 11, 0.3)',
    duration: 0.12,
    ease: 'power4.in',
  })
  tl.to(innerRef.value, {
    scale: 1.08,
    duration: 0.2,
    ease: 'power2.out',
  })
  tl.add(() => emit('select', props.member))
  tl.to(innerRef.value, {
    scale: 1,
    boxShadow: '0 0 20px rgba(245, 158, 11, 0.08)',
    duration: 0.4,
    ease: 'power2.out',
  })
}

function triggerSparkle() {
  showRareEffect.value = true
  nextTick(() => {
    sparkleEls.value.forEach((el) => {
      if (!el) return
      gsap.fromTo(el, {
        opacity: 0,
        scale: 0,
        y: 0,
      }, {
        opacity: 1,
        scale: gsap.utils.random(1, 2.5),
        y: gsap.utils.random(-40, -80),
        duration: gsap.utils.random(0.8, 1.5),
        ease: 'power2.out',
        onComplete: () => {
          gsap.to(el, { opacity: 0, duration: 0.3 })
        },
      })
    })
    setTimeout(() => {
      showRareEffect.value = false
      sparkleEls.value = []
    }, 2500)
  })
}

onMounted(() => {
  // Online dot pulse
  gsap.to(onlineDotRef.value, {
    scale: 1,
    duration: 0.4,
    ease: 'back.out(2)',
    delay: 0.5 + props.index * 0.1,
  })
  gsap.to(onlineDotRef.value, {
    boxShadow: '0 0 15px rgba(245, 158, 11, 0.6)',
    duration: 1.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    delay: 1,
  })

  // Idle floating
  floatTween = gsap.to(cardRef.value, {
    y: '-=8',
    duration: 3 + Math.random() * 2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    delay: Math.random() * 2,
  })

  // Reflection sweep
  const afterEl = innerRef.value
  if (afterEl) {
    gsap.fromTo(afterEl, {
      '--sweep-x': '-100%',
    }, {
      '--sweep-x': '200%',
      duration: 4 + Math.random() * 2,
      repeat: -1,
      ease: 'none',
      delay: Math.random() * 3,
    })
  }
})
</script>
