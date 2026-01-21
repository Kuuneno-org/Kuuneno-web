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
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "tests/**"],
  },
});
