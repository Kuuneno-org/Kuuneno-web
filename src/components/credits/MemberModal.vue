<template>
  <Teleport to="body">
    <div
      v-if="member"
      ref="overlayRef"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 opacity-0"
      role="dialog"
      :aria-label="`Détails pour ${member.name}`"
      aria-modal="true"
      @click.self="close"
      @keydown.escape="close"
    >
      <!-- Backdrop -->
      <div ref="backdropRef" class="absolute inset-0 bg-void/90 backdrop-blur-xl opacity-0" @click="close" />

      <!-- Modal content -->
      <div
        ref="modalRef"
        class="relative glass-strong rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 md:p-10 opacity-0"
      >
        <!-- Close button -->
        <button
          ref="closeBtnRef"
          class="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-muted hover:text-glow hover:bg-glow/10 transition-colors duration-300 group opacity-0"
          @click="close"
          aria-label="Fermer la modale"
        >
          <svg class="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Avatar + Name section -->
        <div class="flex flex-col items-center mb-8">
          <div
            ref="avatarRef"
            class="relative mb-5 cursor-pointer opacity-0"
            @click="onAvatarClick"
          >
            <div class="w-28 h-28 rounded-full overflow-hidden border-2 border-glow/40 shadow-[0_0_40px_rgba(245,158,11,0.25)]">
              <img
                :src="member.avatar"
                :alt="`Avatar de ${member.name}`"
                class="w-full h-full object-cover"
                crossorigin="anonymous"
              />
            </div>
            <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-glow/80 border-2 border-void" />
          </div>

          <!-- Easter egg message -->
          <p
            ref="easterEggRef"
            class="text-gold text-xs font-body mb-2 text-glow-gold opacity-0 h-0 overflow-hidden"
          >
            {{ easterEggMessage }}
          </p>

          <h2 ref="modalNameRef" class="font-display text-2xl md:text-3xl font-bold text-light tracking-wider text-center mb-1 opacity-0">
            {{ member.name }}
          </h2>
          <p ref="modalRoleRef" class="font-body text-glow text-sm tracking-wider uppercase mb-2 opacity-0">{{ member.role }}</p>
          <span ref="modalBadgeRef" class="px-4 py-1 text-xs font-body font-medium tracking-wider uppercase rounded-full bg-glow/10 text-glow border border-glow/20 opacity-0">
            {{ member.badge }}
          </span>
        </div>

        <!-- Bio -->
        <p ref="bioRef" class="font-body text-muted leading-relaxed text-center max-w-lg mx-auto mb-8 opacity-0">
          {{ member.bio }}
        </p>

        <!-- Quote -->
        <blockquote ref="quoteRef" class="text-center mb-10 opacity-0">
          <p class="font-body text-light/60 italic text-sm leading-relaxed">
            {{ member.quote }}
          </p>
        </blockquote>

        <!-- RPG Stats -->
        <div ref="statsContainerRef" class="mb-10 opacity-0">
          <h3 class="font-display text-xs tracking-[0.3em] uppercase text-muted mb-5 text-center">Statistiques du Personnage</h3>
          <div class="space-y-4">
            <div
              v-for="stat in member.stats"
              :key="stat.label"
              class="flex items-center gap-4"
            >
              <span class="font-body text-xs text-muted w-28 text-right shrink-0">{{ stat.label }}</span>
              <div class="flex-1 stat-bar-bg rounded-full h-2.5 overflow-hidden">
                <div
                  :ref="(el) => statBarEls.push(el as HTMLElement)"
                  class="stat-bar-fill h-full rounded-full w-0"
                  :data-width="(stat.value / stat.max) * 100"
                />
              </div>
              <span
                :ref="(el) => statValueEls.push(el as HTMLElement)"
                class="font-display text-xs text-glow w-12 tabular-nums"
                :data-target="stat.value"
              >
                0
              </span>
            </div>
          </div>
        </div>

        <!-- Social links -->
        <div ref="socialsRef" class="flex justify-center gap-3 opacity-0">
          <a
            v-for="social in member.socials"
            :key="social.type"
            :href="social.url"
            class="w-10 h-10 rounded-full flex items-center justify-center bg-glow/5 border border-glow/10 text-muted hover:text-glow hover:bg-glow/15 hover:border-glow/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300"
            :aria-label="`${member.name}'s ${social.type}`"
          >
            <svg v-if="social.type === 'github'" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <svg v-else-if="social.type === 'twitter'" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <svg v-else-if="social.type === 'linkedin'" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import gsap from 'gsap'
import { TeamMember } from '@/data/credits-data';

const props = defineProps<{
  member: TeamMember | null
}>()

const emit = defineEmits<{
  close: []
}>()

const overlayRef = ref<HTMLElement | null>(null)
const backdropRef = ref<HTMLElement | null>(null)
const modalRef = ref<HTMLElement | null>(null)
const closeBtnRef = ref<HTMLElement | null>(null)
const avatarRef = ref<HTMLElement | null>(null)
const modalNameRef = ref<HTMLElement | null>(null)
const modalRoleRef = ref<HTMLElement | null>(null)
const modalBadgeRef = ref<HTMLElement | null>(null)
const bioRef = ref<HTMLElement | null>(null)
const quoteRef = ref<HTMLElement | null>(null)
const statsContainerRef = ref<HTMLElement | null>(null)
const socialsRef = ref<HTMLElement | null>(null)
const easterEggRef = ref<HTMLElement | null>(null)

const statBarEls = ref<HTMLElement[]>([])
const statValueEls = ref<HTMLElement[]>([])

let openTl: gsap.core.Timeline | null = null

// Easter egg
const avatarClicks = ref(0)
const easterEggMessage = ref('')
const easterEggMessages = [
  'You found a secret! This one likes pineapple on pizza.',
  'Achievement Unlocked: Persistent Clicker!',
  'Hey! That tickles!',
  'You discovered a hidden trait: Legendary Snacker.',
  'Error 418: I am a teapot.',
  'Congratulations! You wasted 5 clicks. Worth it.',
  'Hidden buff activated: +10 Charisma.',
  'This member secretly listens to lo-fi while coding.',
]

function onAvatarClick() {
  // Bounce animation on every click
  gsap.fromTo(avatarRef.value, { scale: 1 }, {
    scale: 1.15,
    duration: 0.15,
    yoyo: true,
    repeat: 1,
    ease: 'power2.out',
  })

  avatarClicks.value++
  if (avatarClicks.value >= 5) {
    easterEggMessage.value = easterEggMessages[Math.floor(Math.random() * easterEggMessages.length)]
    gsap.to(easterEggRef.value, {
      opacity: 1,
      height: 'auto',
      duration: 0.5,
      ease: 'back.out(1.5)',
    })
    avatarClicks.value = 0
    gsap.delayedCall(4, () => {
      gsap.to(easterEggRef.value, {
        opacity: 0,
        height: 0,
        duration: 0.4,
        ease: 'power2.in',
      })
    })
  }
}

function animateOpen() {
  statBarEls.value = []
  statValueEls.value = []

  nextTick(() => {
    openTl = gsap.timeline()

    // Overlay visible
    openTl.set(overlayRef.value, { opacity: 1 })

    // Backdrop fade in
    openTl.to(backdropRef.value, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
    })

    // Modal: scale up from nothing with elastic feel
    openTl.fromTo(modalRef.value, {
      opacity: 0,
      scale: 0.6,
      y: 60,
      rotateX: 15,
      filter: 'blur(10px)',
    }, {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      filter: 'blur(0px)',
      duration: 0.7,
      ease: 'back.out(1.4)',
    }, '-=0.1')

    // Close button spin in
    openTl.fromTo(closeBtnRef.value, {
      opacity: 0,
      rotate: -180,
      scale: 0,
    }, {
      opacity: 1,
      rotate: 0,
      scale: 1,
      duration: 0.5,
      ease: 'back.out(2)',
    }, '-=0.3')

    // Avatar drops in with bounce
    openTl.fromTo(avatarRef.value, {
      opacity: 0,
      y: -50,
      scale: 0.5,
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: 'bounce.out',
    }, '-=0.4')

    // Name, role, badge stagger
    openTl.fromTo([modalNameRef.value, modalRoleRef.value, modalBadgeRef.value], {
      opacity: 0,
      y: 20,
      filter: 'blur(5px)',
    }, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.1,
    }, '-=0.2')

    // Bio slides in
    openTl.fromTo(bioRef.value, {
      opacity: 0,
      x: -30,
    }, {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: 'power3.out',
    }, '-=0.2')

    // Quote fades in
    openTl.fromTo(quoteRef.value, {
      opacity: 0,
      scale: 0.9,
    }, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'power2.out',
    }, '-=0.3')

    // Stats container
    openTl.fromTo(statsContainerRef.value, {
      opacity: 0,
      y: 20,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
    }, '-=0.2')

    // Stat bars animate width with counter
    openTl.add(() => {
      statBarEls.value.forEach((bar, i) => {
        if (!bar) return
        const targetWidth = bar.dataset.width || '0'
        gsap.to(bar, {
          width: `${targetWidth}%`,
          duration: 1.2,
          ease: 'power3.out',
          delay: i * 0.12,
        })
      })
      statValueEls.value.forEach((el, i) => {
        if (!el) return
        const target = parseInt(el.dataset.target || '0')
        gsap.to({ val: 0 }, {
          val: target,
          duration: 1.2,
          ease: 'power3.out',
          delay: i * 0.12,
          onUpdate: function() {
            el.textContent = Math.round(this.targets()[0].val).toString()
          },
        })
      })
    })

    // Socials pop in
    openTl.fromTo(socialsRef.value, {
      opacity: 0,
      y: 15,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
    }, '-=0.8')

    document.body.style.overflow = 'hidden'
  })
}

function close() {
  const closeTl = gsap.timeline({
    onComplete: () => {
      emit('close')
      document.body.style.overflow = ''
    },
  })

  closeTl.to(modalRef.value, {
    opacity: 0,
    scale: 0.85,
    y: 40,
    filter: 'blur(8px)',
    duration: 0.35,
    ease: 'power3.in',
  })

  closeTl.to(backdropRef.value, {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.in',
  }, '-=0.15')

  closeTl.set(overlayRef.value, { opacity: 0 })
}

watch(() => props.member, (newVal) => {
  if (newVal) {
    avatarClicks.value = 0
    animateOpen()
  }
})
</script>

<style scoped>
.stat-bar-bg {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
}

.stat-bar-fill {
    background: linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%);
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
}
</style>
