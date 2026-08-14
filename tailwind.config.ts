import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],

  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        background: "#0b0b0b",
        foreground: "#f5f5f5",

        gold: {
          50: "#fffbea",
          100: "#fff3c4",
          200: "#ffe687",
          300: "#ffd54a",
          400: "#f5c227",
          500: "#d4af37",
          600: "#b28d22",
          700: "#8f6b1c",
          800: "#74551d",
          900: "#62471d",
        },
      },

      maxWidth: {
        content: "1200px",
      },

      boxShadow: {
        gold: "0 0 30px rgba(212, 175, 55, 0.18)",
      },
    },
  },

  plugins: [],
};

export default config;