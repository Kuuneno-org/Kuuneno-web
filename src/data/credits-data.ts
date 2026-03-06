export interface TeamMember {
  id: string;
  name: string;
  role: string;
  badge: string;
  avatar: string;
  bio: string;
  quote: string;
  stats: {
    label: string;
    value: number;
    max: number;
    display?: string;
  }[];
  socials: {
    type: "github" | "twitter" | "linkedin" | "website";
    url: string;
  }[];
}

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Lorem Ipsum",
    role: "Directrice de Création",
    badge: "Visionnaire",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Sawyer", // Placeholder path
    bio: "Architecte de mondes invisibles. Aria façonne l'âme de chaque pixel et polygone, tissant la narration dans le tissu de l'univers du jeu. Avec une formation en art classique et en sculpture numérique, elle apporte une esthétique picturale unique au projet.",
    quote: "Chaque pixel raconte une histoire — il suffit d'écouter.",
    stats: [
      { label: "Créativité", value: 98, max: 100 },
      { label: "Vision", value: 95, max: 100 },
      { label: "Mondes Construits", value: 42, max: 100, display: "42" },
      { label: "Café Consommé", value: 99, max: 100, display: "∞" },
    ],
    socials: [
      { type: "twitter", url: "#" },
      { type: "website", url: "#" },
    ],
  },
  {
    id: "2",
    name: "Lorem Ipsum",
    role: "Développeur Principal",
    badge: "Sorcier du Code",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Liliana",
    bio: "Maître des architectures arcaniques et des algorithmes interdits. Kael transforme des idées impossibles en réalités fluides à 60fps. Il se spécialise dans l'optimisation des pipelines de rendu et l'élimination des bugs avant même qu'ils n'existent.",
    quote: "Le meilleur code est celui qui n'existe pas.",
    stats: [
      { label: "Intelligence", value: 96, max: 100 },
      { label: "Chasse aux Bugs", value: 92, max: 100, display: "347" },
      { label: "Lignes Écrites", value: 88, max: 100, display: "500k+" },
      { label: "Stack Overflows", value: 75, max: 100, display: "0 (mensonge)" },
    ],
    socials: [
      { type: "github", url: "#" },
      { type: "twitter", url: "#" },
    ],
  },
  {
    id: "3",
    name: "Lorem Ipsum",
    role: "Conceptrice de Jeu",
    badge: "Tisseuse de Rêves",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=George",
    bio: "Luna conçoit des systèmes qui respirent, des mécaniques qui chantent et des boucles dans lesquelles les joueurs perdent leurs week-ends. Elle se concentre sur le gameplay émergent et l'agentivité du joueur, s'assurant que chaque choix a du sens.",
    quote: "Un jeu est une conversation entre le concepteur et le joueur.",
    stats: [
      { label: "Créativité", value: 97, max: 100 },
      { label: "Conception Système", value: 94, max: 100 },
      { label: "Playtests Effectués", value: 80, max: 100, display: "200+" },
      { label: "Facteur Fun", value: 99, max: 100 },
    ],
    socials: [
      { type: "twitter", url: "#" },
      { type: "linkedin", url: "#" },
    ],
  },
  {
    id: "4",
    name: "Lorem Ipsum",
    role: "Artiste 3D",
    badge: "Poly-Forgeron",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Easton",
    bio: "Sculpteur de rêves numériques. Orion insuffle la vie aux personnages et environnements avec des détails méticuleux et une maîtrise artistique. Il aime explorer l'intersection des formes organiques et de la modélisation hard-surface.",
    quote: "En les polygones nous croyons.",
    stats: [
      { label: "Artistique", value: 99, max: 100 },
      { label: "Détail", value: 96, max: 100 },
      { label: "Modèles Créés", value: 85, max: 100, display: "1,200+" },
      { label: "Heures de Rendu", value: 90, max: 100, display: "9,999" },
    ],
    socials: [
      { type: "website", url: "#" },
      { type: "twitter", url: "#" },
    ],
  },
  {
    id: "5",
    name: "Lorem Ipsum",
    role: "Concepteur Sonore",
    badge: "Audio-Mancien",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Chase",
    bio: "Tissant le silence et le son en une tapisserie immersive. Zephyr croit que l'audio représente 50% de l'expérience, créant des paysages sonores qui hantent et inspirent.",
    quote: "Le silence est juste un autre instrument.",
    stats: [
      { label: "Ouïe", value: 100, max: 100 },
      { label: "Composition", value: 93, max: 100 },
      { label: "SFX Créés", value: 88, max: 100, display: "850+" },
      { label: "Volume", value: 11, max: 11, display: "11" },
    ],
    socials: [
      { type: "website", url: "#" },
    ],
  },
  {
    id: "6",
    name: "Lorem Ipsum",
    role: "Designer UI/UX",
    badge: "Perfectionniste",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Jocelyn",
    bio: "Création d'interfaces qui semblent invisibles mais puissantes. Nyx s'assure que chaque interaction est intuitive, accessible et belle.",
    quote: "Le bon design est évident. Le grand design est transparent.",
    stats: [
      { label: "Empathie", value: 98, max: 100 },
      { label: "Esthétique", value: 95, max: 100 },
      { label: "Flux Utilisateurs", value: 92, max: 100, display: "Infini" },
      { label: "Pixels Poussés", value: 89, max: 100, display: "Des Millions" },
    ],
    socials: [
      { type: "linkedin", url: "#" },
      { type: "website", url: "#" },
    ],
  },
  {
    id: "7",
    name: "Lorem Ipsum",
    role: "Responsable Communauté",
    badge: "Ambassadrice",
    avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Solara",
    bio: "Le pont entre le studio et les joueurs. Solara construit des communautés, gère le chaos et fait avancer le train de la hype.",
    quote: "La communauté est le battement de cœur du jeu.",
    stats: [
      { label: "Charisme", value: 100, max: 100 },
      { label: "Patience", value: 99, max: 100 },
      { label: "Posts Écrits", value: 95, max: 100, display: "10k+" },
      { label: "Mèmes Partagés", value: 90, max: 100, display: "Trop" },
    ],
    socials: [
      { type: "twitter", url: "#" },
      { type: "linkedin", url: "#" },
    ],
  },
];

export const technologies = {
  "Développement Web": ["Vue 3", "TypeScript", "Vite", "Pinia", "Tailwind CSS"],
  "3D & Animation": ["Three.js", "GSAP", "Blender"]
};

export const specialThanks = [
  "Campus YNOV Strasbourg",
  "Nos Premiers Testeurs",
  "Machines à Café",
  "Stack Overflow",
  "Internet",
];
