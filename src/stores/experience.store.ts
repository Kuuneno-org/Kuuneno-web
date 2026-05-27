import { defineStore } from "pinia";

const STORAGE_KEY = "kuuneno-experience";

interface ExperienceState {
  fireOn: boolean;
  audioEnabled: boolean;
  lastVisitTime: number | null;
  visitCount: number;
}

/**
 * Charge l'état depuis localStorage avec fallback
 */
function loadState(): ExperienceState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Erreur chargement localStorage:", error);
  }
  return {
    fireOn: false,
    audioEnabled: false,
    lastVisitTime: null,
    visitCount: 0,
  };
}

/**
 * Sauvegarde l'état dans localStorage
 */
function saveState(state: ExperienceState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Erreur sauvegarde localStorage:", error);
  }
}

export const useExperienceStore = defineStore("experience", {
  state: (): ExperienceState => loadState(),
  
  getters: {
    /**
     * Retourne le temps depuis la dernière visite en ms, ou null si première visite
     */
    timeSinceLastVisit(): number | null {
      if (!this.lastVisitTime) return null;
      return Date.now() - this.lastVisitTime;
    },

    /**
     * Retourne true si c'est la première visite (visitCount === 1)
     */
    isFirstVisit(): boolean {
      return this.visitCount === 1;
    },
  },
  
  actions: {
    setFireOn(v: boolean) {
      this.fireOn = v;
      saveState(this.$state);
    },
    
    setAudioEnabled(v: boolean) {
      this.audioEnabled = v;
      saveState(this.$state);
    },

    /**
     * Enregistre une visite
     */
    recordVisit(): void {
      this.lastVisitTime = Date.now();
      this.visitCount++;
      saveState(this.$state);
    },

    /**
     * Réinitialise toutes les préférences
     */
    reset(): void {
      this.fireOn = false;
      this.audioEnabled = false;
      // Garder l'historique de visites
      saveState(this.$state);
    },
  },
});
