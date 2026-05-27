import { onBeforeUnmount, ref } from 'vue';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { appConfig } from '@/config/env';

interface CacheEntry {
  gltf: GLTF;
  loadedAt: number;
}

/**
 * Cache LRU simple pour les modèles GLTF
 * Évite de recharger les mêmes modèles plusieurs fois
 * Limité par TTL (time-to-live) et nombre max d'entrées
 */
class GLTFCache {
  private cache = new Map<string, CacheEntry>();
  private loader = new GLTFLoader();
  private loadingPromises = new Map<string, Promise<GLTF>>();

  /**
   * Vérifier si une entrée en cache est encore valide
   */
  private isValid(entry: CacheEntry): boolean {
    const age = Date.now() - entry.loadedAt;
    return age < appConfig.cache.modelsTTL;
  }

  /**
   * Charge un modèle, en utilisant le cache si disponible
   */
  async load(url: string): Promise<GLTF> {
    // Vérifier le cache
    const cached = this.cache.get(url);
    if (cached && this.isValid(cached)) {
      console.log(`📦 [Cache hit] ${url}`);
      return cached.gltf;
    }

    // Vérifier si un chargement est déjà en cours
    if (this.loadingPromises.has(url)) {
      console.log(`⏳ [Loading in progress] ${url}`);
      return this.loadingPromises.get(url)!;
    }

    // Démarrer un nouveau chargement
    const loadPromise = new Promise<GLTF>((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          // Nettoyer le cache si dépassé
          if (this.cache.size >= appConfig.cache.maxModels) {
            // Supprimer la plus vieille entrée (LRU simple)
            let oldest: [string, CacheEntry] | null = null;
            for (const [key, entry] of this.cache.entries()) {
              if (!oldest || entry.loadedAt < oldest[1].loadedAt) {
                oldest = [key, entry];
              }
            }
            if (oldest) {
              console.log(`🗑️ [Evicting] ${oldest[0]}`);
              this.cache.delete(oldest[0]);
            }
          }

          // Stocker en cache
          this.cache.set(url, {
            gltf,
            loadedAt: Date.now(),
          });
          console.log(`✅ [Cached] ${url}`);
          resolve(gltf);
        },
        undefined,
        (error) => {
          console.error(`❌ [Error loading] ${url}:`, error);
          reject(error);
        }
      );
    });

    this.loadingPromises.set(url, loadPromise);

    try {
      const result = await loadPromise;
      return result;
    } finally {
      this.loadingPromises.delete(url);
    }
  }

  /**
   * Nettoyer le cache
   */
  clear(): void {
    this.cache.clear();
    console.log('🗑️ [Cache cleared]');
  }

  /**
   * Stats du cache
   */
  getStats(): { size: number; maxSize: number; ttl: number } {
    return {
      size: this.cache.size,
      maxSize: appConfig.cache.maxModels,
      ttl: appConfig.cache.modelsTTL,
    };
  }
}

// Singleton global
const globalCache = new GLTFCache();

/**
 * Composable pour utiliser le cache GLTF dans les composants
 */
export function useGLTFCache() {
  const isLoading = ref(false);

  async function load(url: string): Promise<GLTF> {
    isLoading.value = true;
    try {
      return await globalCache.load(url);
    } finally {
      isLoading.value = false;
    }
  }

  function clear(): void {
    globalCache.clear();
  }

  function getStats() {
    return globalCache.getStats();
  }

  onBeforeUnmount(() => {
    // Ne pas nettoyer le cache global à la destruction
    // car d'autres composants pourraient l'utiliser
  });

  return {
    load,
    clear,
    getStats,
    isLoading,
  };
}
