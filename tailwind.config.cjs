module.exports = {
  content: [
    './resources/**/*.{html,ts,tsx}',
    'node_modules/daisyui/dist/**/*.js',
    'node_modules/stratosphere-ui/dist/**/*.js',
  ],
  daisyui: {
    themes: [
      'business',
      'coffee',
      'cyberpunk',
      'dark',
      'emerald',
      'lemonade',
      'light',
      'night',
      'nord',
      'sunset',
      'winter',
    ],
  },
  theme: {
    extend: {
      transitionProperty: {
        height: 'height',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
    require('tailwind-scrollbar'),
  ],
};
