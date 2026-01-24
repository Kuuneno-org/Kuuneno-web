import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: () => import("@/pages/HomePage.vue") },
  { path: "/histoire", name: "story", component: () => import("@/pages/StoryPage.vue") },
  { path: "/credits", name: "credits", component: () => import("@/pages/StubPage.vue") },
  { path: "/lore", name: "lore", component: () => import("@/pages/StubPage.vue") },
  { path: "/mini-jeu", name: "minigame", component: () => import("@/pages/StubPage.vue") },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
