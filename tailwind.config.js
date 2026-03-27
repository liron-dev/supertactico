/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: '#0a0f1e',
        'navy-light': '#1a2744',
        gold: '#FFD700',
        'gold-dark': '#B8860B',
        sea: '#1a3a5c',
        'sea-dark': '#0d2236',
        land: '#2d5a1b',
        'land-dark': '#1a3610',
        island: '#b8860b',
        'island-light': '#d4a017',
      },
      fontFamily: {
        military: ['monospace'],
      },
    },
  },
  plugins: [],
};
