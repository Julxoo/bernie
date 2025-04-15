/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
    "./src/utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',     // Très petits mobiles
        'sm': '640px',     // Petits mobiles et tablettes
        'md': '768px',     // Tablettes
        'lg': '1024px',    // Petits écrans
        'xl': '1280px',    // Écrans moyens
        '2xl': '1536px',   // Grands écrans
        '3xl': '1920px',   // Très grands écrans
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
        screens: {
          '2xl': '1400px',
        },
      },
    },
  },
  plugins: [],
}; 