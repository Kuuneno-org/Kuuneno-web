<template>
    <div class="tribe-page">
        <!-- Video Background -->
        <div class="video-container">
            <video class="bg-video" autoplay loop muted playsinline>
                <source src="@/assets/bg-anim.mp4" type="video/mp4" />
            </video>
            <div class="video-overlay"></div>
        </div>

        <!-- Header -->
        <header class="header">
            <div class="header-left">
                <button class="back-btn" @click="goBack">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 12H5"/>
                        <path d="m12 19-7-7 7-7"/>
                    </svg>
                    <span>Retour</span>
                </button>
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
            <div class="content-container">
                <h1 class="page-title">La Tribu</h1>
                <p class="page-subtitle">Rencontrez les esprits derrière Kuuneno.</p>

                <div class="tribe-layout">
                    <!-- Left Sidebar: Member List -->
                    <div class="members-sidebar">
                        <div 
                            v-for="(member, index) in members" 
                            :key="index" 
                            class="member-item"
                            :class="{ 'active': selectedMember.name === member.name }"
                            @click="selectMember(member)"
                        >
                            <div class="member-avatar-small">{{ member.initials }}</div>
                            <div class="member-info-small">
                                <span class="name">{{ member.name }}</span>
                                <span class="role">{{ member.role }}</span>
                            </div>
                            <div class="active-indicator"></div>
                        </div>
                    </div>

                    <!-- Right Panel: Details -->
                    <div class="member-details-panel">
                        <transition name="fade-slide" mode="out-in">
                            <div :key="selectedMember.name" class="details-content">
                                <div class="details-header">
                                    <div class="details-avatar">{{ selectedMember.initials }}</div>
                                    <div class="details-title">
                                        <h2>{{ selectedMember.name }}</h2>
                                        <p class="details-role-large">{{ selectedMember.role }}</p>
                                    </div>
                                </div>
                                
                                <div class="details-body">
                                    <section class="bio-section">
                                        <h3>À propos</h3>
                                        <p>{{ selectedMember.bio }}</p>
                                    </section>
                                    
                                    <div class="details-grid">
                                        <section class="contributions-section">
                                            <h3>Réalisations</h3>
                                            <ul class="contributions-list">
                                                <li v-for="(item, idx) in selectedMember.contributions" :key="idx">
                                                    <span class="bullet">•</span> {{ item }}
                                                </li>
                                            </ul>
                                        </section>
                                        
                                        <section class="skills-section">
                                            <h3>Compétences</h3>
                                            <div class="skills-tags">
                                                <span v-for="skill in selectedMember.skills" :key="skill" class="skill-tag">{{ skill }}</span>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        </transition>
                    </div>
                </div>
            </div>
        </main>

        <!-- Menu Sidebar -->
        <CreditsSidebar :is-open="isMenuOpen" @close="toggleMenu" @navigate="handleMenuNavigation" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import gsap from 'gsap';
import CreditsSidebar from '@/components/credits/CreditsSidebar.vue';

const router = useRouter();
const isMenuOpen = ref(false);

interface Member {
    name: string;
    role: string;
    initials: string;
    bio: string;
    contributions: string[];
    skills: string[];
}

const members: Member[] = [
    { 
        name: 'Patrick Namegni', 
        role: 'Lead Developer', 
        initials: 'PN',
        bio: 'Passionné par le développement web et les expériences immersives. Patrick a orchestré l\'architecture technique de Kuuneno, veillant à la fluidité et à la performance de l\'application.',
        contributions: ['Architecture Vue 3 & TypeScript', 'Intégration du moteur de jeu', 'Système de navigation', 'Animations GSAP complexes'],
        skills: ['Vue.js', 'TypeScript', 'WebGL', 'UI/UX Architecture']
    },
    { 
        name: 'Membre 2', 
        role: 'Designer 3D', 
        initials: 'M2',
        bio: 'Artiste 3D talentueux spécialisé dans la modélisation environnementale. Il a donné vie à l\'univers visuel de la tribu Kuuneno.',
        contributions: ['Modélisation des assets', 'Textures et matériaux', 'Éclairage de la scène', 'Optimisation des modèles'],
        skills: ['Blender', 'Substance Painter', 'Lighting', 'Optimization']
    },
    { 
        name: 'Membre 3', 
        role: 'Sound Designer', 
        initials: 'M3',
        bio: 'Créateur d\'ambiances sonores, il a composé la bande originale et conçu les effets sonores qui immergent le joueur dans l\'histoire.',
        contributions: ['Composition musicale', 'Sound Design FX', 'Mixage audio', 'Intégration audio interactive'],
        skills: ['Ableton Live', 'FMOD', 'Sound Design', 'Mixing']
    },
    { 
        name: 'Membre 4', 
        role: 'Narrative Designer', 
        initials: 'M4',
        bio: 'Plume du projet, il a tissé la trame narrative et les légendes de la tribu, donnant du sens à chaque interaction.',
        contributions: ['Écriture du scénario', 'Dialogues et textes', 'Construction du Lore', 'Structure narrative'],
        skills: ['Creative Writing', 'World Building', 'Narrative Structure', 'Storytelling']
    },
];

const selectedMember = ref<Member>(members[0]);

function selectMember(member: Member) {
    selectedMember.value = member;
}

function goBack() {
    const tl = gsap.timeline({
        onComplete: () => {
            router.back();
        }
    });

    tl.to('.member-details-panel', {
        x: 50,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in'
    })
    .to('.members-sidebar', {
        x: -50,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in'
    }, '-=0.2')
    .to('.page-subtitle', {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in'
    }, '-=0.2')
    .to('.page-title', {
        y: 30,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in'
    }, '-=0.2');
}

function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value;
}

function handleMenuNavigation(item: { label: string; action: string }) {
    if (item.action === 'home') {
        router.push('/');
    } else if (item.action === 'about') {
        router.push('/credits');
    } else if (item.action === 'tribe') {
        toggleMenu();
    } else {
        console.log('Navigate to:', item.label);
        toggleMenu();
    }
}

onMounted(async () => {
    await nextTick();
    
    // Set initial state to avoid flash or permanent hidden state
    gsap.set('.page-title, .page-subtitle, .members-sidebar, .member-details-panel', {
        opacity: 0
    });

    const tl = gsap.timeline();

    tl.fromTo('.page-title', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    )
    .fromTo('.page-subtitle', 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 
        '-=0.6'
    )
    .fromTo('.members-sidebar', 
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 
        '-=0.4'
    )
    .fromTo('.member-details-panel', 
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 
        '-=0.6'
    );
});
</script>

<style scoped>
.tribe-page {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    color: #fff;
    font-family: 'Montserrat', 'Inter', sans-serif;
}

/* ... Existing styles ... */

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
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
}

.header {
    position: relative;
    z-index: 20;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 48px;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 10px 20px;
    border-radius: 30px;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.back-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(-5px);
}

.menu-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.menu-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
}

.burger-icon {
    width: 20px;
    height: 14px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.burger-icon span {
    display: block;
    width: 100%;
    height: 2px;
    background-color: white;
    transition: all 0.3s ease;
}

.burger-icon.is-active span:nth-child(1) {
    transform: translateY(6px) rotate(45deg);
}

.burger-icon.is-active span:nth-child(2) {
    transform: translateY(-6px) rotate(-45deg);
}

.content-container {
    position: relative;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 48px 40px;
    z-index: 10;
    height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
}

.page-title {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.page-subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 2rem;
}

/* New Layout Styles */
.tribe-layout {
    display: flex;
    gap: 40px;
    flex: 1;
    min-height: 0; /* Important for nested scrolling */
}

/* Sidebar Styles */
.members-sidebar {
    width: 320px;
    flex-shrink: 0;
    overflow-y: auto;
    padding-right: 10px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.members-sidebar::-webkit-scrollbar {
    width: 4px;
}
.members-sidebar::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.2);
    border-radius: 4px;
}

.member-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.member-item:hover {
    background: rgba(255, 255, 255, 0.08);
}

.member-item.active {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(165, 180, 252, 0.4);
}

.member-avatar-small {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4f46e5 0%, #818cf8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    color: white;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.member-info-small {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.member-info-small .name {
    font-weight: 600;
    font-size: 1rem;
    color: #fff;
}

.member-info-small .role {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
}

.active-indicator {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #a5b4fc;
    opacity: 0;
    transition: opacity 0.3s;
}

.member-item.active .active-indicator {
    opacity: 1;
}

/* Right Panel Styles */
.member-details-panel {
    flex: 1;
    background: rgba(10, 16, 30, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 40px;
    backdrop-filter: blur(10px);
    overflow-y: auto;
    position: relative;
}

.details-content {
    max-width: 900px;
    margin: 0 auto;
}

.details-header {
    display: flex;
    align-items: center;
    gap: 32px;
    margin-bottom: 40px;
    padding-bottom: 30px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.details-avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4f46e5 0%, #818cf8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    box-shadow: 0 10px 30px rgba(79, 70, 229, 0.4);
    border: 4px solid rgba(255, 255, 255, 0.1);
}

.details-title h2 {
    font-size: 2.5rem;
    margin: 0 0 8px 0;
    font-weight: 700;
}

.details-role-large {
    font-size: 1.2rem;
    color: #a5b4fc;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 0;
}

.details-body h3 {
    font-size: 1.4rem;
    margin-bottom: 16px;
    color: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    gap: 10px;
}

.details-body h3::before {
    content: '';
    display: block;
    width: 24px;
    height: 2px;
    background: #a5b4fc;
}

.bio-section {
    margin-bottom: 40px;
}

.bio-section p {
    font-size: 1.1rem;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.8);
}

.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
}

.contributions-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.contributions-list li {
    padding: 8px 0;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    color: rgba(255, 255, 255, 0.8);
}

.contributions-list .bullet {
    color: #a5b4fc;
}

.skills-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.skill-tag {
    background: rgba(165, 180, 252, 0.1);
    border: 1px solid rgba(165, 180, 252, 0.3);
    color: #e0e7ff;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.9rem;
    transition: all 0.2s;
}

.skill-tag:hover {
    background: rgba(165, 180, 252, 0.2);
    transform: translateY(-2px);
}

/* Transition Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.4s ease;
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateX(20px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}

@media (max-width: 900px) {
    .tribe-layout {
        flex-direction: column;
        overflow-y: auto;
    }

    .members-sidebar {
        width: 100%;
        flex-direction: row;
        overflow-x: auto;
        padding-bottom: 10px;
    }

    .member-item {
        min-width: 200px;
    }

    .details-grid {
        grid-template-columns: 1fr;
    }
}
</style>