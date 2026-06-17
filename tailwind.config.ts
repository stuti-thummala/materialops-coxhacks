import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#222831",
        "bg-soft": "#081a2e",
        ops: {
          bg: "rgb(var(--ops-bg) / <alpha-value>)",
          surface: "rgb(var(--ops-surface) / <alpha-value>)",
          ink: "rgb(var(--ops-ink) / <alpha-value>)",
          muted: "rgb(var(--ops-muted) / <alpha-value>)",
          border: "rgb(var(--ops-border) / <alpha-value>)",
          navy: "rgb(var(--ops-navy) / <alpha-value>)",
          green: "rgb(var(--ops-green) / <alpha-value>)",
          greenDark: "rgb(var(--ops-green-dark) / <alpha-value>)",
          amber: "rgb(var(--ops-amber) / <alpha-value>)",
          red: "rgb(var(--ops-red) / <alpha-value>)",
          blue: "rgb(var(--ops-blue) / <alpha-value>)",
          purple: "rgb(var(--ops-purple) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-plex)", "var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-grotesk)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "scan-sweep": {
          "0%": { transform: "translateY(0)", opacity: "0.2" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(15rem)", opacity: "0.2" },
        },
      },
      animation: {
        "scan-sweep": "scan-sweep 0.85s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
