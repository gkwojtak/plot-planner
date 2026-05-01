import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tokens map to CSS variables defined in globals.css
        bg: "hsl(var(--bg))",
        surface: "hsl(var(--surface))",
        "surface-2": "hsl(var(--surface-2))",
        border: "hsl(var(--border))",
        fg: "hsl(var(--fg))",
        "fg-muted": "hsl(var(--fg-muted))",
        accent: {
          DEFAULT: "hsl(var(--accent))",
          hover: "hsl(var(--accent-hover))",
          foreground: "hsl(var(--accent-foreground))",
        },
        wood: {
          DEFAULT: "hsl(var(--wood))",
          dark: "hsl(var(--wood-dark))",
        },
        status: {
          pass: "hsl(var(--status-pass))",
          warning: "hsl(var(--status-warning))",
          error: "hsl(var(--status-error))",
        },
      },
      borderRadius: {
        panel: "1.25rem",
        chip: "9999px",
      },
      boxShadow: {
        panel: "0 8px 32px rgba(20, 20, 30, 0.06)",
        "panel-lg": "0 16px 48px rgba(20, 20, 30, 0.10)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
