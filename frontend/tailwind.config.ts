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
      },
      boxShadow: {
        panel: "0 12px 40px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["Circular", "Avenir Next", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
