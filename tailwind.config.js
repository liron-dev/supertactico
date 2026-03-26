/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        sea: { light: "#4a90d9", DEFAULT: "#2563ab", dark: "#1a4a7a" },
        land: { light: "#6b8e4e", DEFAULT: "#4a6e35", dark: "#3a5528" },
        island: { light: "#d4a853", DEFAULT: "#b8922e", dark: "#8a6d22" },
        "player-yellow": { light: "#fde68a", DEFAULT: "#f59e0b", dark: "#b45309" },
        "player-blue": { light: "#93c5fd", DEFAULT: "#3b82f6", dark: "#1d4ed8" },
        tactical: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#627d98",
          600: "#486581",
          700: "#334e68",
          800: "#243b53",
          900: "#102a43",
          950: "#0a1929",
        },
      },
    },
  },
  plugins: [],
};
