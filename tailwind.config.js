/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",     
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", 
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", 
    "./pages/**/*.{js,ts,jsx,tsx,mdx}"    
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Mulish', 'sans-serif'],
      },
      colors: {
        evaltia: {
          background: "#0B1B34",       // fondo general de pantallas
          dark: "#06121F",             // fondo oscuro para secciones
          card: "#1A2235",             // formularios
          input: "#0F172A",            // inputs
          primary: "#00B4D8",          // botones
          primaryHover: "#009EC2",     // hover botón
          textLight: "#B0BFCF",        // texto claro
          error: "#EF4444",
          success: "#22C55E",
          whiteCard: "#FFFFFF",        // tarjeta clara
          lightGray: "#F6F5FA",        // fondo alternativo claro
        },
      },
    },
  },
  plugins: [],
};