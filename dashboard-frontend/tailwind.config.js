/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ✅ Aktifkan dark mode manual via class
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // ✅ Semua file dalam src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

