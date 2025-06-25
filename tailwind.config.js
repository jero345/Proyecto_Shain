/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gradientStart: "#C94E2E",   // 0%
        gradientMid1: "#7A1E58",    // 19%
        gradientMid2: "#431764",    // 43%
        gradientEnd: "#000819",     // 100%
      },
      backgroundImage: {
        'custom-gradient': 'linear-gradient(90deg, #C94E2E 0%, #7A1E58 19%, #431764 43%, #000819 100%)',
      }
    },
  },
  plugins: [],
};