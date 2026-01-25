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
    activeIndex: -1,
  }),
  getters: {
    activeItem(state): HomeNavItem | { label: string; kind?: string; route?: string } {
      if (state.activeIndex < 0 || state.activeIndex >= state.items.length) {
        return { label: "--" };
      }
      return state.items[state.activeIndex];
    },
  },
  actions: {
    next() {
      if (this.items.length === 0) return;
      if (this.activeIndex === -1) {
        this.activeIndex = 0;
      } else {
        this.activeIndex = (this.activeIndex + 1) % this.items.length;
      }
    },
    prev() {
      if (this.items.length === 0) return;
      if (this.activeIndex === -1) {
        this.activeIndex = this.items.length - 1;
      } else {
        this.activeIndex = (this.activeIndex - 1 + this.items.length) % this.items.length;
      }
    },
    setIndex(i: number) {
      if (this.items.length === 0) return;
      if (i === -1) {
        this.activeIndex = -1;
        return;
      }
      const n = this.items.length;
      this.activeIndex = ((i % n) + n) % n;
    },
  },
});
