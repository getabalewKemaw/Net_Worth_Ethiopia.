/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--color-brand)',
          dark: 'var(--color-brand-dark)',
          light: 'var(--color-brand-light)',
          soft: 'var(--color-brand-soft)',
          text: '#111827',
        },
        primary: {
          DEFAULT: 'var(--color-brand)',
          dark: 'var(--color-brand-dark)',
          light: 'var(--color-brand-light)',
          soft: 'var(--color-brand-soft)',
        },
        expense: {
          DEFAULT: 'var(--color-expense)',
          dark: 'var(--color-expense-dark)',
          light: 'var(--color-expense-light)',
          soft: 'var(--color-expense-soft)',
        },
      },
    },
  },
  plugins: [],
}
