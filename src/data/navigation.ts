import type { HomeItemKind } from "@/stores/homeControls";

export type NavItem = {
  key: HomeItemKind;
  label: string;
  route: string;
};

export const NAV_ITEMS: NavItem[] = [
  { key: "mask", label: "Histoire interactive", route: "/histoire" },
  { key: "altar", label: "Crédits", route: "/credits" },
  { key: "book", label: "Lore / Concept arts", route: "/lore" },
  { key: "gamepad", label: "Mini-jeu", route: "/mini-jeu" },
];
