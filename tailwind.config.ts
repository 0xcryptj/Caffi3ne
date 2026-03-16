import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f6f1ea",
        espresso: {
          50: "#f5ebe0",
          100: "#e8d5bf",
          200: "#d1ae86",
          300: "#b47d4d",
          400: "#8f562d",
          500: "#704221",
          600: "#59351c",
          700: "#452815",
          800: "#321c0f",
          900: "#211109"
        },
        oat: "#e8dccd",
        sage: "#96a28b",
        crema: "#fff8ef"
      },
      boxShadow: {
        panel: "0 18px 60px rgba(38, 25, 14, 0.12)"
      },
      fontFamily: {
        display: [
          "Georgia",
          "ui-serif",
          "serif"
        ],
        body: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ]
      },
      backgroundImage: {
        "hero-glow": "radial-gradient(circle at top left, rgba(180, 125, 77, 0.22), transparent 38%), radial-gradient(circle at bottom right, rgba(150, 162, 139, 0.16), transparent 24%)"
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" }
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "pop-in": {
          "0%":   { opacity: "0", transform: "scale(0.92)" },
          "65%":  { opacity: "1", transform: "scale(1.03)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" }
        }
      },
      animation: {
        "fade-up":        "fade-up 0.38s ease-out both",
        "fade-in":        "fade-in 0.28s ease-out both",
        "scale-in":       "scale-in 0.32s ease-out both",
        "slide-up":       "slide-up 0.4s ease-out both",
        "pop-in":         "pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "slide-in-right": "slide-in-right 0.35s ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
