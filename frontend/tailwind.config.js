/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#102033',
        aqua: '#10b8c7',
        coral: '#ff7058',
        amberline: '#f5b841',
        meadow: '#2fbf71'
      },
      boxShadow: {
        glow: '0 24px 90px rgba(16, 184, 199, 0.22)',
        panel: '0 16px 55px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: []
};

