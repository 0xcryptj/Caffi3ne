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
      }
    }
  },
  plugins: []
};

export default config;
