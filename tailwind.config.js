/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: "#0a0f1e",
        "navy-light": "#1a2744",
        gold: "#FFD700",
        "gold-dark": "#B8960F",
        sea: "#1a3a5c",
        "sea-light": "#1e4a73",
        land: "#2d5a1b",
        "land-light": "#3a7022",
        island: "#b8860b",
        "island-light": "#c9a033",
      },
    },
  },
  plugins: [],
};
