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
        primary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        brand: {
          primary: "#E05058",
          "primary-hover": "#c83c44",
          "dark-rust": "#3e2620",
          "dark-rust-hover": "#2f1b17",
          warm: "#EDEDED",
          dark: "#1A1A1A",
          orange: "#E05058",
          "orange-hover": "#c83c44",
          "dark-pill": "#1A1A1A",
          "dark-pill-hover": "#0A0A0A",
        },
        slate: {
          950: "#020617"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        outfit: ["var(--font-outfit)", "Outfit", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Roboto Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
