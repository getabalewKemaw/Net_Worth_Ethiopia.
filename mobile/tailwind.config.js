/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#535233',
          dark: '#3d3c25',
          light: '#6e6d47',
          text: '#503D2E',
        },
        primary: {
          DEFAULT: '#535233',
          dark: '#3d3c25',
          light: '#6e6d47',
        },
      },
    },
  },
  plugins: [],
}
