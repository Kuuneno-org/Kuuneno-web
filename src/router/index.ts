import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: () => import("@/pages/HomePage.vue") },
  { path: "/histoire", name: "story", component: () => import("@/pages/StoryPage.vue") },
  { path: "/credits", name: "credits", component: () => import("@/pages/CreditsPage.vue") },
  { path: "/tribu", name: "tribe", component: () => import("@/pages/TribePage.vue") },
  { path: "/lore", name: "lore", component: () => import("@/pages/StubPage.vue") },
  { path: "/mini-jeu", name: "minigame", component: () => import("@/pages/MiniGamePage.vue") },
  { path: "/game-server", name: "gameserver", component: () => import("@/pages/GameServerPage.vue") },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
