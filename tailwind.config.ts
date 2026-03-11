import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hub: {
          // ── Main content (light / cream) ──────────────────────
          bg: "#f0efe8",
          card: "#ffffff",
          hover: "#e8e7e0",
          border: "#e0dfd8",
          accent: "#c8d432",        // lime-yellow
          "accent-dark": "#a8b428",
          text: "#1a1a1a",
          muted: "#888888",
          red: "#ef4444",
          "red-bg": "#fef2f2",
          "badge-bg": "#f5f4ed",
          tan: "#c8b89c",           // beige/tan cards
          // ── Sidebar (dark) ────────────────────────────────────
          sidebar: "#141414",
          "sidebar-text": "#e8e8e8",
          "sidebar-muted": "#666666",
          "sidebar-border": "#2a2a2a",
          "sidebar-hover": "#1e1e1e",
          "sidebar-active": "#c8d432",
          "sidebar-active-text": "#141414",
        },
        ift: {
          navy: "#0A1628",
          blue: "#0D2B5E",
          accent: "#1E5FD8",
          gold: "#C9A84C",
          light: "#E8EDF5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
