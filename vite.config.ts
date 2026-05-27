import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { configDefaults } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    // Optimisation du bundle
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer les console.log en prod
        drop_debugger: true,
      },
    },
    // Code splitting pour les gros modules
    rollupOptions: {
      output: {
        manualChunks: {
          // Isoler Three.js pour un chunk séparé (lourd)
          three: ["three"],
          // Vue Router et Pinia dans un chunk
          vendor: ["vue", "vue-router", "pinia"],
          // GSAP dans son chunk
          gsap: ["gsap"],
        },
      },
    },
    // Source maps pour debug en prod (peut être désactivé si pas besoin)
    sourcemap: true,
    // Optimisation de la taille
    reportCompressedSize: true,
    cssCodeSplit: true,
    // Async chunks chargés en parallèle plutôt que inline
    chunkFileNames: "js/[name]-[hash].js",
    entryFileNames: "js/[name]-[hash].js",
    assetFileNames: (assetInfo) => {
      const info = assetInfo.name.split(".");
      let ext = info[info.length - 1];
      if (/png|jpe?g|gif|tiff|bmp|ico/i.test(ext)) {
        ext = "img";
      } else if (/woff|woff2|ttf|otf|eot/i.test(ext)) {
        ext = "fonts";
      } else if (ext === "css") {
        ext = "css";
      } else if (ext === "svg") {
        ext = "svg";
      }
      return `${ext}/[name]-[hash][extname]`;
    },
  },
  // Optimisation du serveur de développement
  server: {
    // Précharger les modules fréquemment utilisés
    preTransformRequests: [
      "/src/main.ts",
      "/src/App.vue",
      "/src/router/index.ts",
    ],
  },
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "tests/**"],
  },
});
