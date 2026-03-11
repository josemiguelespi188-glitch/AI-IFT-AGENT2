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
          bg: "#192919",
          sidebar: "#142014",
          card: "#1d2d1d",
          hover: "#223222",
          border: "#2a3d2a",
          accent: "#4ade80",
          "accent-muted": "#166534",
          text: "#d4e8d4",
          muted: "#6b8f6b",
          red: "#ef4444",
          "red-bg": "#2d1515",
          "badge-bg": "#1a3a1a",
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
