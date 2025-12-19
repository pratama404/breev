/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        aqi: {
          good: '#00E400',
          moderate: '#FFFF00',
          unhealthy: '#FF7E00',
          veryUnhealthy: '#FF0000',
          hazardous: '#8F3F97',
          dangerous: '#7E0023'
        }
      }
    },
  },
  plugins: [],
}