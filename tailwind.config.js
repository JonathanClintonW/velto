/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx}',
      './src/components/**/*.{js,ts,jsx,tsx}',
      './src/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Archivo', 'system-ui', 'sans-serif'],
          'archivo': ['Archivo', 'sans-serif'],
        },
        colors: {
          'white': '#FFFFFF',
          'black': '#000000',
          'light-gray': '#d3d3d3',
          'gray': '#878787',
          'dark-gray': '#5e5e5e',
          'darker-gray': '#363636',
          'darker-purple': '#0c070c',
          'light-purple': '#ba69db',
          'dark-purple': '#4e2c5c',
          'light-turquoise': '#1efcbd',
          'turquoise': '#05f5b0',
        },
        boxShadow: {
          'smaller-outer': '0 0 6px 2px rgba(5, 245, 176, 0.8)',
          'small-outer': '0 0 15px 5px rgba(5, 245, 176, 1)',
          'danger-smaller-outer': '0 0 6px 2px rgba(255, 30, 30, 0.8)',
        },
      },
    },
    plugins: [],
  };
