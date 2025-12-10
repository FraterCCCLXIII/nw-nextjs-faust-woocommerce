/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/components/**/*.tsx', './src/pages/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        // Tether exact color palette
        tether: {
          cream: '#F6F4F0',
          'cream-light': '#F9F4E9',
          'cream-lighter': '#F4F2EF',
          beige: '#EBE9E5',
          dark: '#161514',
          black: '#000000',
          white: '#FFFFFF',
          // Opacity variants
          'cream-opacity': '#F6F4F00D',
          'cream-light-opacity': '#FFFFFF1A',
          'beige-opacity': '#EBE9E582',
          'black-opacity': '#0000002B',
        },
        primary: {
          DEFAULT: '#161514', // Tether dark
          50: '#F6F4F0',
          100: '#F9F4E9',
          200: '#F4F2EF',
          300: '#EBE9E5',
          400: '#161514',
          500: '#000000',
        },
        accent: {
          DEFAULT: '#161514', // Tether accent
          50: '#F6F4F0',
          100: '#EBE9E5',
        },
      },
      backgroundColor: {
        'tether-cream': '#F6F4F0',
        'tether-cream-light': '#F9F4E9',
        'tether-beige': '#EBE9E5',
        'tether-dark': '#161514',
      },
      textColor: {
        'tether-dark': '#161514',
        'tether-cream': '#F6F4F0',
        'tether-beige': '#EBE9E5',
      },
      backgroundImage: {
        'hero-background': "url('/images/hero.jpg')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'tether': '15px',
        'tether-lg': '20px',
        'tether-full': '100px',
      },
      backdropBlur: {
        'tether': '20px',
      },
    },
  },
  plugins: [],
};
