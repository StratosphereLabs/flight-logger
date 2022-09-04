module.exports = {
  content: ['index.html', 'resources/**/*.{html,ts,tsx}'],
  daisyui: {
    themes: ['light', 'dark'],
  },
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
};
