/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        mono: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'diffusion': '0 20px 40px -15px rgba(0, 0, 0, 0.05)',
        'tactile': '0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 1px 0 rgba(0, 0, 0, 0.02)',
        'tactile-hover': '0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'deck-key': '0 2px 0 0 rgba(203, 213, 225, 0.8), 0 1px 3px rgba(0, 0, 0, 0.04)',
      },
      colors: {
        studio: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },
      },
    },
  },
  plugins: [],
}
