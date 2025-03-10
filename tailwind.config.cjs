module.exports = {
  content: [
    './resources/**/*.{html,ts,tsx}',
    'node_modules/daisyui/dist/**/*.js',
    'node_modules/stratosphere-ui/dist/**/*.js',
  ],
  daisyui: {
    themes: [
      'light',
      'dark',
      'wireframe',
      'synthwave',
      'lofi',
      'night',
      'cyberpunk',
    ],
  },
  theme: {
    extend: {
      transitionProperty: {
        height: 'height',
      },
      colors: {
        'prose-headings': 'var(--tw-prose-headings)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
    require('tailwind-scrollbar'),
  ],
};
