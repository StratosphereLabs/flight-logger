export default {
  content: [
    './resources/**/*.{html,ts,tsx}',
    'node_modules/daisyui/**/*.js',
    'node_modules/stratosphere-ui/dist/**/*.js',
  ],
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
};
