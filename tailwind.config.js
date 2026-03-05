/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glow: "#f59e0b", // Amber-500 from Home page accent
        void: "#050814", // Dark background from Home page
        muted: "#94a3b8", // Slate-400 for secondary text
        gold: "#fbbf24", // Amber-400 for highlights
        light: "#f8fafc", // Slate-50 for primary text
      },
    },
  },
  plugins: [],
};
