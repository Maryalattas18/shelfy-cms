/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#378ADD',
        'primary-dark': '#185FA5',
        'primary-light': '#E6F1FB',
      },
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      }
    }
  },
  plugins: []
}
