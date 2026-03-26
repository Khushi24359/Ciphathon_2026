/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: "#00FFC6",
        danger: "#FF3B3B",
        warning: "#FFC857",
        bgDark: "#0A0F1C",
        card: "rgba(255,255,255,0.05)"
      },
      backdropBlur: {
        xl: "20px"
      }
    },
  },
  plugins: [],
}
