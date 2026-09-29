/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          light: '#e0e7ff',
          dark: '#312e81'
        },
        secondary: {
          DEFAULT: '#06b6d4',
          hover: '#0891b2',
          light: '#cffafe'
        },
        surface: {
          light: '#f8fafc',
          dark: '#0f172a',
          cardLight: '#ffffff',
          cardDark: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
