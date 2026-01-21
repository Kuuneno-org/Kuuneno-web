import { defineStore } from "pinia";

export type HomeItemKind = "mask" | "altar" | "book" | "gamepad";

export interface HomeNavItem {
  kind: HomeItemKind;
  label: string;
  route: string;
}

export const useHomeControls = defineStore("homeControls", {
  state: () => ({
    items: [
      { kind: "mask", label: "Histoire interactive", route: "/histoire" },
      { kind: "altar", label: "Crédits", route: "/credits" },
      { kind: "book", label: "Lore", route: "/lore" },
      { kind: "gamepad", label: "Mini-jeu", route: "/mini-jeu" },
    ] as HomeNavItem[],
    activeIndex: 0,
  }),
  getters: {
    activeItem(state): HomeNavItem {
      return state.items[state.activeIndex] ?? state.items[0];
    },
  },
  actions: {
    next() {
      if (this.items.length === 0) return;
      this.activeIndex = (this.activeIndex + 1) % this.items.length;
    },
    prev() {
      if (this.items.length === 0) return;
      this.activeIndex = (this.activeIndex - 1 + this.items.length) % this.items.length;
    },
    setIndex(i: number) {
      if (this.items.length === 0) return;
      const n = this.items.length;
      this.activeIndex = ((i % n) + n) % n;
    },
  },
});
