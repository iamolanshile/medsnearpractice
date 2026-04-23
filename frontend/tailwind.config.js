/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00478d',
        'primary-dark': '#003a73',
        'primary-light': '#005eb8',
        secondary: '#4a5f83',
        surface: '#f9f9fc',
        'surface-low': '#f3f3f6',
        'surface-high': '#e8e8ea',
        'on-surface': '#1a1c1e',
        'on-surface-variant': '#424752',
        outline: '#c2c6d4',
        error: '#ba1a1a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        label: ['"Public Sans"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
