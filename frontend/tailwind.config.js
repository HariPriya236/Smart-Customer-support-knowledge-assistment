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
        dark: {
          bg: '#0B0F17',
          card: '#131C2E',
          surface: '#1E293B',
          border: '#334155',
          hover: '#2A374A'
        },
        brand: {
          primary: '#6366F1',
          primaryHover: '#4F46E5',
          accent: '#818CF8',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#F43F5E'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
