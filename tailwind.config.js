module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        nord: {
          polar0: '#2e3440',
          polar1: '#3b4252',
          polar3: '#4c566a',
          snow6: '#eceff4',
          frost8: '#88c0d0',
          aurora11: '#bf616a',
          aurora14: '#a3be8c',
        },
      },
    },
  },
  plugins: [],
};
