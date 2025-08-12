/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html", // Scans the main HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all component files in the src folder
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")], // Keep the animation plugin
}
