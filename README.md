# 🔥 Kuuneno Web

[![CI](https://github.com/Kuuneno-org/Kuuneno-web/actions/workflows/ci.yml/badge.svg)](https://github.com/Kuuneno-org/Kuuneno-web/actions/workflows/ci.yml)
![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

Bienvenue sur le dépôt officiel du projet **Kuuneno Web**. Cette application web immersive propose une expérience interactive en 3D autour d'un feu de camp, servant de portail vers différentes sections narratives et ludiques (Histoire, Lore, Crédits, Mini-jeu).

## 🎯 Contexte du Projet

Kuuneno est un projet étudiant réalisé dans le cadre des YDAYS à Ynov Strasbourg. L'objectif est de créer une vitrine technologique et artistique, plongeant l'utilisateur dans un univers onirique dès la page d'accueil.

L'application résout le problème de l'engagement utilisateur en transformant une simple navigation web en une expérience exploratoire mémorable.

## 🛠️ Technologies & Outils

Ce projet utilise une stack moderne axée sur la performance et l'expérience utilisateur :

- **Core :** [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool :** [Vite](https://vitejs.dev/)
- **State Management :** [Pinia](https://pinia.vuejs.org/)
- **3D & Graphisme :** [Three.js](https://threejs.org/) + Canvas API
- **Styles :** [Tailwind CSS](https://tailwindcss.com/) + CSS3 Variables
- **Routing :** Vue Router
- **Qualité & Tests :**
  - [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) (Linting & Formatting)
  - [Vitest](https://vitest.dev/) (Tests Unitaires)
  - [Playwright](https://playwright.dev/) (Tests End-to-End)
- **CI/CD :** GitHub Actions

## 📦 Fonctionnalités Principales

- 🌌 **Ambiance Immersive :** Scène 3D interactive avec un ciel étoilé dynamique et des effets de lumière.
- 🧭 **Navigation Circulaire :** Système de carrousel 3D permettant de choisir entre différents modules (Masque, Autel, Livre, Gamepad).
- 📱 **Responsive Design :** Interface adaptée aux écrans de bureau et mobiles.
- 🎭 **Architecture Modulaire :** Composants Vue découplés et réutilisables.

## 🚀 Installation & Lancement

### Prérequis

- **Node.js** : Version 20 (recommandée, voir `.nvmrc`).
- **npm** : Gestionnaire de paquets inclus avec Node.js.

### Étapes d'installation

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/Kuuneno-org/Kuuneno-web.git
   cd kuuneno-web
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:5173`.

## 🛡️ Scripts & Commandes Utiles

Nous avons mis en place un script utilitaire pour garantir la qualité du code avant chaque push.

| Commande | Description |
| :--- | :--- |
| `npm run dev` | Lance le serveur de développement. |
| `npm run build` | Compile l'application pour la production. |
| `npm run preview` | Prévisualise la version de production localement. |
| `npm run nrv` | **Nickel Rendez-Vous** : Lance Lint + Type Check + Tests Unitaires. |
| `npm run nrv -- --fix` | Corrige automatiquement le linting et lance les vérifications. |
| `npm run test:e2e` | Lance les tests End-to-End avec Playwright. |

## 📁 Structure du Projet

```
kuuneno-web/
├── .github/            # Workflows CI/CD
├── scripts/            # Scripts utilitaires (nrv.sh)
├── src/
│   ├── components/     # Composants Vue (HomeScene, NightSky...)
│   ├── composables/    # Logique réutilisable (Hooks)
│   ├── data/           # Données statiques
│   ├── pages/          # Vues principales (Router views)
│   ├── router/         # Configuration du routing
│   ├── stores/         # Stores Pinia (État global)
│   ├── styles/         # Fichiers CSS globaux & Tailwind
│   ├── App.vue         # Composant racine
│   └── main.ts         # Point d'entrée
├── tests/              # Tests E2E Playwright
└── vite.config.ts      # Configuration Vite
```

## 🔁 Workflow Git & Contribution

Nous suivons un workflow collaboratif strict pour maintenir la stabilité de la branche principale.

1.  **Branches :**
    - `main` : Branche de production stable. Ne jamais commit directement dessus.
    - `feat/nom-feature` : Pour les nouvelles fonctionnalités.
    - `fix/nom-bug` : Pour les corrections de bugs.

2.  **Pull Requests (PR) :**
    - Ouvrez une PR vers `main` lorsque votre fonctionnalité est terminée.
    - La CI (GitHub Actions) lancera automatiquement les tests.
    - Une revue de code par un autre membre de l'équipe est requise avant le merge.

3.  **Avant de push :**
    Assurez-vous toujours que votre code est propre en exécutant :
    ```bash
    npm run nrv
    ```

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

Made with ❤️ by the Kuuneno Team.
