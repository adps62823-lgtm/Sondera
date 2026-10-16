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
        forest: {
          50: '#F2F7F5',
          100: '#E8F3EE',
          200: '#C7E2D6',
          300: '#9FC9B7',
          600: '#2F6F5E',
          700: '#23574A',
          800: '#1B453B',
          900: '#183B34',
          950: '#0F2621',
        },
        surface: {
          light: '#FAFAF7',
          card: '#FFFFFF',
          muted: '#F4F5F0',
          border: '#D9E3DE',
          dark: '#111816',
          darkCard: '#18221F',
          darkMuted: '#202D29',
          darkBorder: '#2E3E39',
        },
        ink: {
          primary: '#1E2926',
          secondary: '#586762',
          muted: '#7E8F8A',
        },
        caution: {
          50: '#FDF8F0',
          500: '#B77C2C',
          700: '#8A5B1E',
        },
        alert: {
          50: '#FDF2F2',
          500: '#C53030',
          700: '#9B2C2C',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
