import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#fbf7f2",
        ink: "#1f1f1f",
        coral: "#ff385c",
        stone: "#6a6a6a",
        line: "#e7e2db",
        // Paleta del dashboard
        "dash-bg": "#f0ede8",
        "dash-accent": "#e8184a",
        "dash-success": "#0f9172",
        "dash-warning": "#f59e0b",
        "dash-error": "#dc2626",
      },
      boxShadow: {
        panel: "0 12px 40px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "DM Sans", "Segoe UI", "sans-serif"],
        display: ["var(--font-sora)", "Sora", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
