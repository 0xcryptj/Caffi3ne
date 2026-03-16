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
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" }
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
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
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) rotate(-2deg)" },
          "50%":      { transform: "translateY(-18px) rotate(2deg)" }
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition:  "200% center" }
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1",   transform: "scale(1)" },
          "50%":      { opacity: "0.7", transform: "scale(0.97)" }
        }
      },
      animation: {
        "fade-up":        "fade-up 0.65s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in":        "fade-in 0.55s ease-out both",
        "scale-in":       "scale-in 0.55s cubic-bezier(0.22,1,0.36,1) both",
        "slide-up":       "slide-up 0.65s cubic-bezier(0.22,1,0.36,1) both",
        "pop-in":         "pop-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "slide-in-right": "slide-in-right 0.60s cubic-bezier(0.22,1,0.36,1) both",
        "float":          "float 5s ease-in-out infinite",
        "shimmer":        "shimmer 2.4s linear infinite",
        "spin-slow":      "spin-slow 18s linear infinite",
        "pulse-soft":     "pulse-soft 3s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
