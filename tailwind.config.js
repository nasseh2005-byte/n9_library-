/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0B1220",
        panel: "#111A2E",
        line: "#1E2A44",
        saudi: { DEFAULT: "#1B8354", light: "#25935F", dark: "#14573A" },
        gold: "#D4AF37",
      },
    },
  },
  plugins: [],
};
