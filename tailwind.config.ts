import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0E0E0E",
          soft: "#1C1C1C",
          muted: "#4A4A4A",
          subtle: "#8A8A86",
        },
        paper: {
          DEFAULT: "#FAFAF7",
          warm: "#F4F1EA",
          raised: "#FFFFFF",
        },
        stone: {
          DEFAULT: "#E8E6E0",
          dark: "#D6D3CB",
        },
        copper: {
          DEFAULT: "#B5754A",
          soft: "#D4A17F",
          deep: "#8F5A37",
        },
        moss: "#4A5542",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.02em",
      },
      maxWidth: {
        "container": "1400px",
      },
    },
  },
  plugins: [],
};

export default config;
