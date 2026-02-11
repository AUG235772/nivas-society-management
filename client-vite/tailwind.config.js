/** @type {import('tailwindcss').Config} */
export default {
  // Removing 'class' ensures it stays light/bright by default
  darkMode: 'media', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'], // We will add a pro font link later
      },
      colors: {
        // The "Brand" Color - A professional, deep Indigo
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1', // Primary Action
          600: '#4f46e5', // Hover State
          900: '#312e81', // Text Headers
        },
        // The "Canvas" - Porcelain & Off-Whites for depth
        canvas: {
          pure: '#ffffff',
          subtle: '#f8fafc', // Main background
          muted: '#f1f5f9', // Borders/Separators
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'float': '0 10px 40px -10px rgba(79, 70, 229, 0.2)', // Indigo glow
      }
    },
  },
  plugins: [],
}