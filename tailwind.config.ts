import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        zestRed: "#C62828",
        zestGreen: "#2E7D32",
        zestOrange: "#FF9800",
        zestBg: "#F8FAF8"
      },
      boxShadow: {
        premium: "0 24px 80px rgba(35, 20, 20, 0.12)",
        soft: "0 12px 32px rgba(20, 52, 30, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
