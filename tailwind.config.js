/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'selector',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'custom': [
          'PingFang SC',
          'Microsoft Yahei',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'Hiragino Sans GB',
          '-apple-system',
          'sans-serif'
        ],
        // 或者更简洁的命名
        'chinese': [
          'PingFang SC',
          'Microsoft Yahei',
          'Hiragino Sans GB',
          '-apple-system',
          'sans-serif'
        ]
      },
      screens: {
        'best-w': { 'raw': '(max-width: 1280px)' },
        'mobile-w': { 'raw': '(max-width: 640px)' },
        // => @media (max-height: 800px) { ... }
      },
      gridTemplateColumns: {
        'auto-100': 'repeat(auto-fill, minmax(100px, 1fr))',
        'auto-150': 'repeat(auto-fill, minmax(150px, 1fr))',
        'auto-200': 'repeat(auto-fill, minmax(200px, 1fr))',
        'auto-250': 'repeat(auto-fill, minmax(250px, 1fr))',
        'auto-270': 'repeat(auto-fill, minmax(270px, 1fr))',
        'auto-300': 'repeat(auto-fill, minmax(300px, 1fr))',
        'auto-320': 'repeat(auto-fill, minmax(320px, 1fr))',
        'auto-350': 'repeat(auto-fill, minmax(350px, 1fr))',
      },
      colors: {
        'primary-purple': '#54458a'
      }
    },
  },
  plugins: [],
};
