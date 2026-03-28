/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        sea: "#1e3a5f",
        land: "#8B7355",
        island: "#6B8E23",
      },
    },
  },
  plugins: [],
};
