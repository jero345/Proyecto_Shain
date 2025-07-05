/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 🔥 Siempre usa dark si añades class="dark" en <html>
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gradientStart: "#C94E2E",
        gradientMid1: "#7A1E58",
        gradientMid2: "#431764",
        gradientEnd: "#000819",
      },
      backgroundImage: {
        'custom-gradient': 'linear-gradient(90deg, #C94E2E 0%, #7A1E58 19%, #431764 43%, #000819 100%)',
      },
    },
  },
  plugins: [],
};
