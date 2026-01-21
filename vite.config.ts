/// <reference types="vitest" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { configDefaults } from "vitest/config";

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
