<template>
  <canvas
    ref="canvasRef"
    class="fixed inset-0 w-full h-full pointer-events-none"
    style="z-index: 0"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId = 0

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  baseSize: number
  opacity: number
  baseOpacity: number
  hue: number
}

let particles: Particle[] = []
const mouse = { x: -9999, y: -9999 }

function onMouseMove(e: MouseEvent) {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

function init() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', onMouseMove)

  const count = Math.min(100, Math.floor(window.innerWidth / 15))
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    size: Math.random() * 2 + 0.5,
    baseSize: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.4 + 0.1,
    baseOpacity: Math.random() * 0.4 + 0.1,
    hue: 35 + Math.random() * 15,
  }))

  // GSAP: animate each particle with a staggered pulse
  particles.forEach((p, i) => {
    gsap.to(p, {
      size: p.baseSize * 2.5,
      opacity: p.baseOpacity * 2,
      duration: 2 + Math.random() * 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.04,
    })
  })

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const p of particles) {
      // Mouse repulsion
      const dx = p.x - mouse.x
      const dy = p.y - mouse.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 180) {
        const force = (180 - dist) / 180
        p.vx += (dx / dist) * force * 0.3
        p.vy += (dy / dist) * force * 0.3
      }

      // Damping
      p.vx *= 0.98
      p.vy *= 0.98

      p.x += p.vx
      p.y += p.vy

      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0

      // Draw glow
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.opacity * 0.08})`
      ctx.fill()

      // Draw particle
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.opacity})`
      ctx.fill()
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 130) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `hsla(45, 100%, 50%, ${0.06 * (1 - dist / 130)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    animationId = requestAnimationFrame(animate)
  }

  animate()
}

onMounted(init)
onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('mousemove', onMouseMove)
})
</script>
