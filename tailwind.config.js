module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        'vista-blue': {
          50: '#f3faf7',
          100: '#d6f1e5',
          200: '#ade2cd',
          300: '#73c8a9',
          400: '#51b090',
          500: '#389477',
          600: '#2a7760',
          700: '#25604f',
          800: '#224d41',
          900: '#204138',
          950: '#0d2620',
        },
        'bright-gray': {
          50: '#f7f8f8',
          100: '#edeef1',
          200: '#d7dae0',
          300: '#b4b9c5',
          400: '#8b95a5',
          500: '#6d788a',
          600: '#586171',
          700: '#484f5c',
          800: '#3e434e',
          900: '#373b44',
          950: '#24262d',
        },
      },
    },
  },
  plugins: [],
};
