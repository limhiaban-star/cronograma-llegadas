export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        macro: {
          blue: '#1F49B6',
          yellow: '#F6DC00',
          teal: '#62CBC9',
          orange: '#F5B335',
          green: '#A2D45E',
          magenta: '#C100A6',
          purple: '#6F1EAF'
        }
      },
      fontFamily: {
        sans: ['Avenir', 'Gotham', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Avenir black"', 'Avenir', 'Gotham', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
