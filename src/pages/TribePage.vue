<template>
  <div class="relative min-h-screen bg-void text-light overflow-x-hidden">
    <!-- Particle background -->
    <ParticleField />

    <!-- Bouton Retour à la page principale -->
    <button class="btn-menu" type="button" @click="returnToHome" aria-label="Retour au menu">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <span>Retour à l'écran d'accueil</span>
    </button>

    <!-- Main content -->
    <main class="relative z-10">
      <!-- Cinematic Intro -->
      <CinematicIntro />

      <!-- Divider glow -->
      <div class="relative h-px mx-auto max-w-xs">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-glow/20 to-transparent" />
      </div>

      <!-- Team Section -->
      <TeamSection @select-member="openMemberModal" />

      <!-- Divider glow -->
      <div class="relative h-px mx-auto max-w-xs">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-glow/20 to-transparent" />
      </div>

      <!-- Technologies -->
      <TechSection />

      <!-- Divider glow -->
      <div class="relative h-px mx-auto max-w-xs">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
      </div>

      <!-- Special Thanks -->
      <SpecialThanks />

      <!-- Footer -->
      <CreditsFooter />
    </main>

    <!-- Member Detail Modal -->
    <MemberModal :member="selectedMember" @close="closeMemberModal" />

    <!-- Konami code easter egg overlay -->
    <Transition name="glitch">
      <div v-if="konamiActive" class="fixed inset-0 z-[100] pointer-events-none" aria-hidden="true">
        <div class="absolute inset-0 mix-blend-screen opacity-30">
          <div class="absolute inset-0 bg-glow/10 animate-pulse" />
          <div class="absolute inset-0" :style="{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(245,158,11,0.03) 2px, rgba(245,158,11,0.03) 4px)',
          }" />
        </div>
        <p
          class="absolute bottom-8 left-1/2 -translate-x-1/2 font-display text-xs tracking-[0.5em] text-glow uppercase">
          GLITCH MODE ACTIVATED
        </p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { TeamMember } from '@/data/credits-data'
import CinematicIntro from '@/components/credits/CinematicIntro.vue'
import CreditsFooter from '@/components/credits/CreditsFooter.vue'
import MemberModal from '@/components/credits/MemberModal.vue'
import SpecialThanks from '@/components/credits/SpecialThanks.vue'
import TeamSection from '@/components/credits/TeamSection.vue'
import TechSection from '@/components/credits/TechSection.vue'
import ParticleField from '@/components/credits/ParticleField.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Member modal
const selectedMember = ref<TeamMember | null>(null)

function openMemberModal(member: TeamMember) {
  selectedMember.value = member
}

function closeMemberModal() {
  selectedMember.value = null
}

// Konami code easter egg
const konamiActive = ref(false)
const konamiSequence = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]
let konamiIndex = 0
let konamiTimeout: ReturnType<typeof setTimeout> | null = null

function onKeyDown(e: KeyboardEvent) {
  if (e.key === konamiSequence[konamiIndex]) {
    konamiIndex++
    if (konamiIndex === konamiSequence.length) {
      konamiActive.value = true
      konamiIndex = 0
      if (konamiTimeout) clearTimeout(konamiTimeout)
      konamiTimeout = setTimeout(() => {
        konamiActive.value = false
      }, 5000)
    }
  } else {
    konamiIndex = 0
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  if (konamiTimeout) clearTimeout(konamiTimeout)
})

function returnToHome() {
  router.push('/')
}
</script>

<style>
.glitch-enter-active,
.glitch-leave-active {
  transition: opacity 0.3s ease;
}

.glitch-enter-from,
.glitch-leave-to {
  opacity: 0;
}

.btn-menu {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 20px;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
}
</style>
