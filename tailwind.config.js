export default {
  content: [
    './resources/**/*.{html,ts,tsx}',
    'node_modules/daisyui/**/*.js',
    'node_modules/stratosphere-ui/dist/**/*.js',
  ],
  theme: {
    extend: {
      keyframes: {
        rise: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 1800s ease-out forwards',
      },
      transitionProperty: {
        height: 'height',
      },
      colors: {
        'prose-headings': 'var(--tw-prose-headings)',
      },
    },
  },
};
