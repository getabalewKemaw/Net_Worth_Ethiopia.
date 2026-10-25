/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lexend_400Regular'],
        lexend: ['Lexend_400Regular'],
        'lexend-light': ['Lexend_300Light'],
        'lexend-regular': ['Lexend_400Regular'],
        'lexend-medium': ['Lexend_500Medium'],
        'lexend-semibold': ['Lexend_600SemiBold'],
        'lexend-bold': ['Lexend_700Bold'],
        'lexend-extrabold': ['Lexend_800ExtraBold'],
      },
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
  plugins: [
    ({ addUtilities }) => {
      addUtilities({
        '.font-thin': { fontFamily: 'Lexend_300Light', fontWeight: '100' },
        '.font-light': { fontFamily: 'Lexend_300Light', fontWeight: '300' },
        '.font-normal': { fontFamily: 'Lexend_400Regular', fontWeight: '400' },
        '.font-medium': { fontFamily: 'Lexend_500Medium', fontWeight: '500' },
        '.font-semibold': { fontFamily: 'Lexend_600SemiBold', fontWeight: '600' },
        '.font-bold': { fontFamily: 'Lexend_700Bold', fontWeight: '700' },
        '.font-extrabold': { fontFamily: 'Lexend_800ExtraBold', fontWeight: '800' },
        '.font-black': { fontFamily: 'Lexend_800ExtraBold', fontWeight: '900' },
      });
    },
  ],
}
