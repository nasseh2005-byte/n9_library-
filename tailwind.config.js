/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // الهوية القانونية: كحلي ملكي + ذهبي (متناسقة مع شعار مكتب المالكي)
        night: "#0A0F2C",
        panel: "#121A3F",
        line: "#26305F",
        royal: { DEFAULT: "#3B43B8", light: "#5A63D8", dark: "#272E86" },
        gold: { DEFAULT: "#C9A227", light: "#E3C558", dark: "#9A7B1A" },
        saudi: { DEFAULT: "#1B8354", light: "#25935F", dark: "#14573A" },
      },
      fontFamily: {
        serif: ["var(--font-amiri)", "serif"],
      },
    },
  },
  plugins: [],
};
