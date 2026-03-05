<template>
    <div class="credits-page">
        <!-- Page Content Wrapper for Animation -->
        <div class="page-content-wrapper">
            <!-- Video Background -->
            <div class="video-container">
                <video ref="bgVideo" class="bg-video" autoplay loop muted playsinline>
                    <source src="@/assets/bg-anim.mp4" type="video/mp4" />
                </video>
                <div class="video-overlay"></div>
            </div>

            <!-- Header -->
            <header class="header">
                <div class="search-wrapper">
                    <button class="icon-btn search-trigger" aria-label="Rechercher" @click="openSearch" ref="searchTrigger">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                    </button>
                    <div class="search-bar" ref="searchBar">
                        <input type="text" class="search-input" placeholder="Rechercher..." ref="searchInput" />
                        <div class="search-divider"></div>
                        <button class="close-search-btn" @click="closeSearch" aria-label="Fermer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                <button class="icon-btn menu-btn" @click="toggleMenu" aria-label="Menu">
                    <div class="burger-icon" :class="{ 'is-active': isMenuOpen }">
                        <span></span>
                        <span></span>
                    </div>
                </button>
            </header>

            <!-- Main Content -->
            <main class="main-content">
                <div class="logo-container">
                    <img src="@/assets/logo/kuuneno_logo.png" alt="Kuuneno Logo" class="app-logo" />
                </div>

                <div class="intro-text">
                    <h1 class="title">Une épopée lunaire entre fascination et fatalité.</h1>
                </div>

                <div class="actions-grid">
                    <!-- Bienvenue Section -->
                    <div class="action-item action-left">
                        <button class="action-btn" @click="openAbout">
                            <span class="btn-text">Bienvenue</span>
                            <div class="btn-ring"></div>
                        </button>
                        <div class="action-desc">
                            <p>Déambulez à travers la vision et les origines de Kuuneno.</p>
                        </div>
                    </div>

                    <!-- Parcourir Section -->
                    <div class="action-item action-right">
                        <button class="action-btn" @click="openCredits">
                            <span class="btn-text">Parcourir</span>
                            <div class="btn-ring"></div>
                        </button>
                        <div class="action-desc">
                            <p>Plongez directement à la rencontre des créateurs du projet.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <!-- Menu Sidebar Component -->
        <CreditsSidebar :is-open="isMenuOpen" @close="toggleMenu" @navigate="handleMenuNavigation" />

        <!-- Content Modals/Overlays (Placeholder for now) -->
        <div class="content-overlay" v-if="activeSection">
            <button class="close-overlay" @click="activeSection = null">×</button>
            <div class="overlay-inner">
                <h2 v-if="activeSection === 'about'">À propos de Kuuneno</h2>
                <div v-if="activeSection === 'about'" class="text-content">
                    <p>Kuuneno est une expérience web immersive explorant les rituels et l'histoire d'une tribu fictive.
                    </p>
                    <p>Développé avec Vue 3, Three.js et beaucoup de passion.</p>
                </div>

                <h2 v-if="activeSection === 'credits'">Crédits & Équipe</h2>
                <div v-if="activeSection === 'credits'" class="credits-list">
                    <div class="credit-group">
                        <h3>Développement</h3>
                        <ul>
                            <li>Patrick Namegni - Développeur Principal</li>
                            <li>Équipe YDAYS - Contributeurs</li>
                        </ul>
                    </div>
                    <div class="credit-group">
                        <h3>Design & 3D</h3>
                        <ul>
                            <li>Artistes 3D - Modèles & Textures</li>
                            <li>UI/UX Design - Interface</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import gsap from 'gsap';
import CreditsSidebar from '@/components/credits/CreditsSidebar.vue';

const router = useRouter();
const activeSection = ref<string | null>(null);

function goHome() {
    router.push('/');
}

function openAbout() {
    activeSection.value = 'about';
}

function openCredits() {
    activeSection.value = 'credits';
}

const searchBar = ref<HTMLElement | null>(null);
const searchTrigger = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLElement | null>(null);
const isMenuOpen = ref(false);

function handleMenuNavigation(item: { label: string; action: string }) {
    if (item.action === 'home') {
        goHome();
        toggleMenu(); 
    } else if (item.action === 'about') {
        openAbout();
        toggleMenu(); 
    } else if (item.action === 'tribe') {
        router.push('/tribu');
        toggleMenu();
    } else {
        console.log('Navigate to:', item.label);
        toggleMenu();
    }
}

function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value;
}

function openSearch() {
    if (!searchBar.value || !searchTrigger.value) return;

    const tl = gsap.timeline();

    const targetWidth = window.innerWidth < 768 ? 260 : 320;

    // Expand search bar
    tl.to(searchBar.value, {
        width: targetWidth,
        opacity: 1,
        padding: '0 16px',
        borderWidth: 1,
        duration: 0.5,
        ease: 'power3.out',
        pointerEvents: 'all'
    });

    // Show content
    tl.fromTo([searchBar.value.querySelector('.search-input'), 
               searchBar.value.querySelector('.search-divider'), 
               searchBar.value.querySelector('.close-search-btn')], 
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' },
        '-=0.3'
    );
    
    // Focus input
    if (searchInput.value) {
        setTimeout(() => searchInput.value?.focus(), 400);
    }
}

function closeSearch() {
    if (!searchBar.value) return;

    const tl = gsap.timeline();

    // Hide content
    tl.to([searchBar.value.querySelector('.search-input'), 
           searchBar.value.querySelector('.search-divider'), 
           searchBar.value.querySelector('.close-search-btn')], 
        { opacity: 0, duration: 0.2, ease: 'power2.in' }
    );

    // Collapse search bar
    tl.to(searchBar.value, {
        width: 0,
        opacity: 0,
        padding: 0,
        borderWidth: 0,
        duration: 0.4,
        ease: 'power3.inOut',
        pointerEvents: 'none'
    });
}

onMounted(() => {
    const tl = gsap.timeline();

    tl.from('.bg-video', {
        opacity: 0,
        duration: 1.5,
        ease: 'power2.inOut'
    })
        .from('.header', {
            y: -50,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.5')
        .from('.app-logo', {
            scale: 0.8,
            opacity: 0,
            duration: 1,
            ease: 'back.out(1.7)'
        }, '-=0.5')
        .from('.intro-text', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.5')
        .from('.action-item', {
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out'
        }, '-=0.3');
});
</script>

<style scoped>
.credits-page {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    color: #fff;
    font-family: 'Montserrat', 'Inter', sans-serif;
}

/* Video Background */
.video-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.bg-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.video-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    /* Darken video */
    backdrop-filter: blur(2px);
}

/* Header */
.header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 32px 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 50; /* Ensure above menu backdrop/sidebar */
    box-sizing: border-box;
}

.search-wrapper {
    position: relative;
    height: 48px;
    display: flex;
    align-items: center;
}

.search-bar {
    position: relative;
    margin-left: 10px;
    height: 48px;
    width: 0;
    background: rgba(255, 255, 255, 0.1);
    border: 0px solid rgba(255, 255, 255, 0.2);
    border-radius: 24px;
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    padding: 0;
    opacity: 0;
    pointer-events: none;
    z-index: 21;
    box-sizing: border-box;
    overflow: hidden;
}

.search-input {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1rem;
    font-family: 'Montserrat', 'Inter', sans-serif;
    outline: none;
    flex: 1;
    min-width: 0;
}

.search-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.search-divider {
    width: 1px;
    height: 24px;
    background: rgba(255, 255, 255, 0.2);
    margin: 0 12px;
}

.close-search-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 50%;
    transition: color 0.3s;
}

.close-search-btn:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
}

.icon-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(5px);
}

.icon-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
}

.menu-label {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 14px;
    letter-spacing: 1px;
}

/* Main Content */
.main-content {
    position: relative;
    z-index: 5;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.logo-container {
    margin-bottom: 40px;
}

.app-logo {
    width: 400px;
    height: auto;
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
}

.intro-text {
    margin-bottom: 60px;
}

.title {
    font-size: 1.25rem;
    font-weight: 500;
    font-family: 'Montserrat', 'Inter', sans-serif;
    text-transform: uppercase;
    margin: 0;
    letter-spacing: 3px;
    line-height: 32px;
    background: linear-gradient(180deg, #fff 0%, #cbd5e1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Actions Grid */
.actions-grid {
    display: flex;
    gap: 80px;
    align-items: flex-start;
}

.action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 280px;
}

.action-btn {
    position: relative;
    width: 220px;
    height: 60px;
    border-radius: 30px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: 0.9rem;
    font-weight: 600;
    font-family: 'Montserrat', 'Inter', sans-serif;
    text-transform: uppercase;
    letter-spacing: 2px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    backdrop-filter: blur(8px);
    overflow: hidden;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

.btn-text {
    position: relative;
    z-index: 2;
    transition: color 0.3s ease;
}

.btn-ring {
    position: absolute;
    top: 0;
    left: 0;
    width: 0%;
    height: 100%;
    background: #f59e0b;
    z-index: 1;
    transition: width 1.8s cubic-bezier(0.19, 1, 0.22, 1);
}

.action-btn:hover {
    border-color: #f59e0b;
    transform: translateY(-2px);
    box-shadow: 0 10px 40px rgba(245, 158, 11, 0.2);
}

.action-btn:hover .btn-ring {
    width: 100%;
}

.action-btn:hover .btn-text {
    color: #0f172a; /* Dark text on white hover */
}

.action-desc h3 {
    font-size: 1.1rem;
    font-family: 'Montserrat', 'Inter', sans-serif;
    margin: 0 0 8px 0;
    font-weight: 600;
    color: #fff;
}

.action-desc p {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
    margin: 0;
}

/* Content Overlay */
.content-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.95);
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    backdrop-filter: blur(20px);
}

.close-overlay {
    position: absolute;
    top: 40px;
    right: 40px;
    background: none;
    border: none;
    color: #fff;
    font-size: 40px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.close-overlay:hover {
    opacity: 1;
}

.overlay-inner {
    max-width: 800px;
    width: 100%;
    text-align: center;
}

.overlay-inner h2 {
    font-size: 3rem;
    margin-bottom: 40px;
    background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.text-content {
    font-size: 1.2rem;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.8);
}

.credits-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
    text-align: left;
}

.credit-group h3 {
    color: #F59E0B;
    font-size: 1.4rem;
    margin-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 8px;
}

.credit-group ul {
    list-style: none;
    padding: 0;
}

.credit-group li {
    margin-bottom: 8px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.1rem;
}

/* Menu styles moved to CreditsSidebar component */

.page-content-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    transform-origin: center center;
    will-change: transform, opacity;
    z-index: 1;
}

.burger-icon {
    width: 24px;
    height: 12px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.burger-icon span {
    display: block;
    width: 100%;
    height: 2px;
    background-color: #fff;
    transition: all 0.3s ease;
    transform-origin: center;
}

.burger-icon.is-active span:nth-child(1) {
    transform: translateY(5px) rotate(45deg);
}

.burger-icon.is-active span:nth-child(2) {
    transform: translateY(-5px) rotate(-45deg);
}

@media (max-width: 768px) {
    .actions-grid {
        flex-direction: column;
        gap: 40px;
    }

    .title {
        font-size: 2.5rem;
    }

    .header {
        padding: 20px;
    }
}
</style>