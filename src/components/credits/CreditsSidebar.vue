<template>
    <div class="menu-backdrop" ref="backdrop" @click="$emit('close')"></div>
    <div class="menu-sidebar" ref="sidebar">
        <div class="menu-nav">
            <div v-for="(item, index) in menuItems" :key="index" class="menu-item" @click="handleItemClick(item)">
                <span class="menu-number">0{{ index + 1 }}</span>
                <span class="menu-text">{{ item.label }}</span>
            </div>
        </div>
        <div class="menu-footer">
            <a v-for="social in socialLinks" :key="social.name" :href="social.url" target="_blank" class="social-link">
                <div class="social-icon" v-html="social.icon"></div>
                <span class="social-name">{{ social.name }}</span>
            </a>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import gsap from 'gsap';

const props = defineProps<{
    isOpen: boolean;
}>();

const emit = defineEmits(['close', 'navigate']);

const sidebar = ref<HTMLElement | null>(null);
const backdrop = ref<HTMLElement | null>(null);

const menuItems = [
    { label: 'Accueil', action: 'home' },
    { label: 'L\'Expérience', action: 'experience' },
    { label: 'La Tribu', action: 'tribe' },
    { label: 'Les Rituels', action: 'rituals' },
    { label: 'La Carte', action: 'map' },
    { label: 'À Propos', action: 'about' },
    { label: 'Contact', action: 'contact' }
];

const socialLinks = [
    { 
        name: 'TikTok', 
        url: '#',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>'
    },
    { 
        name: 'Instagram', 
        url: '#',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>'
    },
    { 
        name: 'YouTube', 
        url: '#',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>'
    }
];

function handleItemClick(item: { label: string; action: string }) {
    emit('navigate', item);
}

watch(() => props.isOpen, (isOpen) => {
    if (!sidebar.value || !backdrop.value) return;

    const tl = gsap.timeline();

    if (isOpen) {
        // OPEN MENU
        tl.to(backdrop.value, {
            opacity: 1,
            pointerEvents: 'all',
            duration: 0.5,
            ease: 'power2.out'
        });

        tl.to(sidebar.value, {
            x: '0%',
            opacity: 1,
            pointerEvents: 'all',
            duration: 0.8,
            ease: 'power3.inOut'
        }, '<');

        tl.fromTo(sidebar.value.querySelectorAll('.menu-item'),
            { x: 50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
            '-=0.4'
        );

        tl.fromTo(sidebar.value.querySelectorAll('.social-link'),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
            '-=0.2'
        );
    } else {
        // CLOSE MENU
        tl.to(sidebar.value, {
            x: '100%',
            opacity: 0,
            pointerEvents: 'none',
            duration: 0.6,
            ease: 'power3.inOut'
        });

        tl.to(backdrop.value, {
            opacity: 0,
            pointerEvents: 'none',
            duration: 0.5,
            ease: 'power2.in'
        }, '<');
    }
});
</script>

<style scoped>
.menu-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 30;
    opacity: 0;
    pointer-events: none;
}

.menu-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 40vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: -20px 0 50px rgba(0, 0, 0, 0.5);
    z-index: 40;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 60px 80px;
    transform: translateX(100%);
    opacity: 0;
    pointer-events: none;
    box-sizing: border-box;
}

.menu-nav {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3vh;
}

.menu-item {
    cursor: pointer;
    display: flex;
    align-items: baseline;
    gap: 20px;
    color: #fff;
    transition: transform 0.3s;
    opacity: 0;
}

.menu-item:hover {
    transform: translateX(10px);
}

.menu-number {
    font-size: 0.9rem;
    font-family: 'Montserrat', 'Inter', sans-serif;
    color: #F59E0B;
    font-weight: 500;
}

.menu-text {
    font-family: serif;
    font-size: 2.5rem;
    font-weight: 400;
    line-height: 1.1;
}

.menu-text:hover {
    color: #facf85;
}

.menu-footer {
    margin-top: 60px;
    display: flex;
    gap: 32px;
}

.social-link {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    transition: all 0.3s ease;
}

.social-link:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.8);
    color: #fff;
    transform: translateY(-2px);
}

.social-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

:deep(.social-icon svg) {
    width: 100%;
    height: 100%;
}

.social-name {
    position: absolute;
    bottom: -25px;
    font-size: 0.75rem;
    font-family: 'Montserrat', 'Inter', sans-serif;
    letter-spacing: 0.5px;
    opacity: 0;
    transform: translateY(5px);
    transition: all 0.3s ease;
    white-space: nowrap;
}

.social-link:hover .social-name {
    opacity: 1;
    transform: translateY(0);
}

@media (max-width: 768px) {
    .menu-sidebar {
        width: 100vw;
        padding: 40px;
        align-items: center;
    }
    
    .menu-nav {
        align-items: center;
    }
    
    .menu-footer {
        justify-content: center;
    }
}
</style>