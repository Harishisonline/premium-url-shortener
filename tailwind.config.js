/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        primary: "#000000",
        secondary: "#0B0C10",
        accent: {
          blue: "#00E5FF",
          purple: "#8A2BE2",
        },
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(0, 229, 255, 0.4)",
        "glow-purple": "0 0 20px rgba(138, 43, 226, 0.4)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
