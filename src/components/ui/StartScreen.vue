<template>
  <transition name="fade" appear>
    <div class="start-screen" ref="startScreenRef">
      <!-- Animated background particles -->
      <div class="particles-container" aria-hidden="true">
        <div
          v-for="particle in particles"
          :key="particle.id"
          class="particle"
          :style="{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
          }"
          :ref="el => { if (el) particleRefs[particle.id] = el }"
        />
      </div>

      <!-- Radial glow overlay -->
      <div class="radial-glow" aria-hidden="true" />

      <!-- Portal effect circles -->
      <div class="portal-rings" aria-hidden="true">
        <div class="ring ring-1" />
        <div class="ring ring-2" />
        <div class="ring ring-3" />
      </div>

      <!-- Main content -->
      <div class="content">
        <!-- Logo with halo -->
        <div class="logo-wrapper">
          <div class="halo" aria-hidden="true" />
          <div class="logo-container">
            <img src="@/assets/logo/logo.png" alt="Kuuneno Logo" class="logo" />
          </div>
        </div>

        <!-- Subtitle -->
        <p class="subtitle">Le portail des Kuunenos s'ouvre</p>

        <!-- Actions section -->
        <div class="actions">
          <button
            class="btn-start"
            :disabled="isDisappearing"
            @click="handleStartClick"
            @mouseenter="onButtonHover"
            @mouseleave="onButtonLeave"
            ref="btnRef"
          >
            <span class="btn-symbol">✦</span>
            <span class="btn-text">Commencer l'aventure</span>
            <span class="btn-symbol">✦</span>
            <div class="btn-glow-effect" />
            <div class="btn-shine" />
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer-info">
        <span class="copyright">© 2026 Kuunenos. Tous droits réservés.</span>
        <span class="version">v1.0.0</span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import gsap from 'gsap';

const emit = defineEmits<{
  (event: 'start'): void;
  (event: 'login-facebook'): void;
  (event: 'help'): void;
}>();

const btnRef = ref<HTMLButtonElement | null>(null);
const startScreenRef = ref<HTMLDivElement | null>(null);
const isDisappearing = ref(false);
const particleRefs = reactive<Record<string, Element>>({});

const particles = Array.from({ length: 34 }, (_, index) => ({
  id: `particle-${index}`,
  x: Math.random() * 100,
  y: Math.random() * 100,
  driftX: Math.random() * 70 - 35,
  driftY: Math.random() * 90 - 45,
  scale: Math.random() * 1.5 + 0.7,
  opacity: Math.random() * 0.55 + 0.22,
  duration: Math.random() * 5 + 6,
  delay: Math.random() * 2,
}));

function onButtonHover() {
  if (!btnRef.value) return;
  gsap.to(btnRef.value, {
    scale: 1.045,
    y: -2,
    duration: 0.3,
    ease: 'power2.out',
  });
}

function handleStartClick() {
  if (isDisappearing.value || !startScreenRef.value) return;
  isDisappearing.value = true;

  gsap
    .timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => emit('start'),
    })
    .to(btnRef.value, {
      scale: 0.94,
      opacity: 0,
      filter: 'blur(10px)',
      duration: 0.28,
    })
    .to(
      startScreenRef.value.querySelector('.content'),
      {
        y: -18,
        scale: 0.96,
        opacity: 0,
        filter: 'blur(18px)',
        duration: 0.45,
      },
      '<0.05'
    )
    .to(
      startScreenRef.value.querySelector('.portal-rings'),
      {
        scale: 1.22,
        opacity: 0,
        filter: 'blur(18px)',
        duration: 0.55,
      },
      '<'
    )
    .to(
      startScreenRef.value.querySelectorAll('.particle'),
      {
        scale: 0,
        opacity: 0,
        stagger: 0.01,
        duration: 0.35,
      },
      '<'
    )
    .to(
      startScreenRef.value,
      {
        opacity: 0,
        duration: 0.38,
      },
      '-=0.2'
    );
}

function onButtonLeave() {
  if (!btnRef.value) return;
  gsap.to(btnRef.value, {
    scale: 1,
    y: 0,
    duration: 0.3,
    ease: 'power2.out',
  });
}

onMounted(() => {
  // Animate particles
  particles.forEach((particle) => {
    const element = particleRefs[particle.id];
    if (!element) return;

    gsap.fromTo(
      element,
      { x: 0, y: 0, scale: 1, opacity: particle.opacity },
      {
        x: particle.driftX,
        y: particle.driftY,
        scale: particle.scale,
        opacity: 1,
        duration: particle.duration,
        delay: particle.delay,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      }
    );
  });

  // Animate logo float
  const logoContainer = document.querySelector('.logo-container');
  if (logoContainer) {
    gsap.fromTo(
      logoContainer,
      { y: 0 },
      {
        y: -12,
        duration: 5.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      }
    );
  }

  // Animate halo
  const halo = document.querySelector('.halo');
  if (halo) {
    gsap.fromTo(
      halo,
      { scale: 0.9, opacity: 0.42 },
      {
        scale: 1.15,
        opacity: 0.75,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      }
    );
  }

  // Animate portal rings
  const rings = document.querySelectorAll('.ring');
  rings.forEach((ring, index) => {
    const isEven = index % 2 === 0;
    const duration = [24, 18, 14][index];
    const direction = isEven ? 360 : -360;

    gsap.to(ring, {
      rotation: direction,
      transformOrigin: '50% 50%',
      duration,
      repeat: -1,
      ease: 'none',
    });

    if (index < 2) {
      gsap.fromTo(
        ring,
        { scale: 1 },
        {
          scale: index === 0 ? 1.04 : 1,
          duration: index === 0 ? 5 : 4.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        }
      );
    }
  });

  // Content entrance animation
  const content = document.querySelector('.content');
  if (content) {
    gsap.fromTo(
      content,
      { opacity: 0, y: 24, scale: 0.95, filter: 'blur(14px)' },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        delay: 0.1,
        ease: [0.16, 1, 0.3, 1],
      }
    );
  }

  // Subtitle animation
  const subtitle = document.querySelector('.subtitle');
  if (subtitle) {
    gsap.fromTo(
      subtitle,
      { opacity: 0, y: 12, filter: 'blur(8px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.55,
        delay: 0.4,
        ease: 'power2.out',
      }
    );
  }

  // Footer animation
  const footer = document.querySelector('.footer-info');
  if (footer) {
    gsap.fromTo(
      footer,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        delay: 0.62,
        ease: 'power2.out',
      }
    );
  }

  // Shine animation on button
  const shine = document.querySelector('.btn-shine');
  if (shine) {
    gsap.fromTo(
      shine,
      { x: '-100%' },
      {
        x: '200%',
        duration: 2.5,
        repeat: -1,
        ease: 'power2.inOut',
        delay: 1,
      }
    );
  }
});
</script>

<style scoped>
.start-screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: radial-gradient(
    circle at center,
    rgba(245, 158, 11, 0.2) 0%,
    rgba(15, 23, 42, 0.62) 38%,
    rgba(5, 8, 20, 0.94) 78%
  );
  backdrop-filter: blur(4px);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
}

/* Background layers */
.start-screen::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    rgba(251, 191, 36, 0.08),
    transparent 35%,
    rgba(56, 189, 248, 0.06) 70%,
    transparent
  );
  pointer-events: none;
}

.radial-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.08), transparent 60%);
  pointer-events: none;
}

/* Particles */
.particles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fbbf24;
  box-shadow: 0 0 18px rgba(251, 191, 36, 0.9);
}

/* Portal rings */
.portal-rings {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(82vw, 620px);
  height: min(82vw, 620px);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.ring {
  position: absolute;
  border-radius: 50%;
  background:
    conic-gradient(
      from 90deg,
      transparent,
      rgba(251, 191, 36, 0.28),
      transparent 38%,
      rgba(255, 255, 255, 0.08),
      transparent 70%
    ),
    radial-gradient(circle, transparent 57%, rgba(245, 158, 11, 0.06), transparent 67%);
  mask-image: radial-gradient(circle, transparent 56%, black 57%, black 61%, transparent 62%);
}

.ring-1 {
  inset: 0;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.ring-2 {
  inset: 9%;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.ring-3 {
  inset: 18%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Content */
.content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 768px;
  padding: 0 24px;
  text-align: center;
}

.logo-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}

.halo {
  position: absolute;
  width: clamp(180px, 28vw, 360px);
  height: clamp(180px, 28vw, 360px);
  border-radius: 50%;
  background: rgba(251, 191, 36, 0.2);
  filter: blur(48px);
  z-index: 0;
}

.logo-container {
  position: relative;
  z-index: 1;
}

.logo {
  width: clamp(220px, 34vw, 430px);
  height: auto;
  display: block;
  filter: drop-shadow(0 28px 80px rgba(0, 0, 0, 0.75));
  user-select: none;
}

.subtitle {
  max-width: 512px;
  font-size: clamp(10px, 0.7rem, 14px);
  font-weight: 600;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: rgba(251, 191, 36, 0.8);
  filter: drop-shadow(0 0 24px rgba(245, 158, 11, 0.45));
  margin: 0 0 24px 0;
}

/* Actions */
.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.btn-start {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(251, 191, 36, 0.35);
  background: rgba(255, 255, 255, 0.07);
  padding: 16px 32px;
  font-size: clamp(12px, 0.875rem, 16px);
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: white;
  cursor: pointer;
  box-shadow: 0 0 34px rgba(245, 158, 11, 0.18);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
  outline: none;
}

.btn-start:hover {
  border-color: rgba(251, 191, 36, 0.7);
  background: rgba(251, 191, 36, 0.15);
}

.btn-start:focus {
  outline: 2px solid rgba(251, 191, 36, 0.7);
  outline-offset: 2px;
}

.btn-start:disabled {
  cursor: not-allowed;
  pointer-events: none;
}

.btn-symbol {
  color: rgba(251, 191, 36, 0.7);
  font-size: 1.2em;
}

.btn-text {
  flex: 1;
}

.btn-glow-effect {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(251, 191, 36, 0.28),
    transparent 64%
  );
  opacity: 0.45;
  transition: opacity 0.3s;
  pointer-events: none;
}

.btn-start:hover .btn-glow-effect {
  opacity: 0.8;
}

.btn-shine {
  position: absolute;
  inset-y: 0;
  left: -50%;
  width: 50%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.35),
    transparent
  );
  transform: skewX(-18deg);
  pointer-events: none;
}

/* Footer */
.footer-info {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 24px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.38);
}

@media (min-width: 640px) {
  .footer-info {
    flex-direction: row;
    justify-content: space-between;
    gap: 0;
    padding: 0 40px;
  }

  .btn-start {
    padding: 20px 48px;
  }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
