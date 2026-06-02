/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Quicksand", "ui-sans-serif", "system-ui", "sans-serif"],
        rounded: ["Quicksand", "ui-rounded", "system-ui", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
      },
      keyframes: {
        "drift-1": {
          "0%, 100%": { transform: "translate(-10%, -5%) scale(1)" },
          "33%": { transform: "translate(15%, 10%) scale(1.25)" },
          "66%": { transform: "translate(-5%, 20%) scale(0.9)" },
        },
        "drift-2": {
          "0%, 100%": { transform: "translate(10%, 15%) scale(1.1)" },
          "33%": { transform: "translate(-20%, -10%) scale(0.85)" },
          "66%": { transform: "translate(12%, -18%) scale(1.2)" },
        },
        "drift-3": {
          "0%, 100%": { transform: "translate(5%, -15%) scale(0.95)" },
          "50%": { transform: "translate(-15%, 12%) scale(1.3)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "drift-1": "drift-1 22s ease-in-out infinite",
        "drift-2": "drift-2 28s ease-in-out infinite",
        "drift-3": "drift-3 19s ease-in-out infinite",
        "spin-slow": "spin-slow 40s linear infinite",
      },
    },
  },
  plugins: [],
};
