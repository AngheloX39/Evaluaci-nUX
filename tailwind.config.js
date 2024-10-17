/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Asegúrate de incluir todas las rutas relevantes
  ],
  theme: {
    extend: {
      colors: {
        cafe1: '#FFD6A7',
        cafe2: '#F69F69',
      },
      fontFamily: {
        italianno: ['Italianno', 'cursive'],
      },
    },
  },
  plugins: [],
};


