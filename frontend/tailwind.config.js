/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🌿 Primary — Tulsi Green (trust, freshness)
        primary: {
          50:  '#f2fbf4',
          100: '#e0f5e4',
          200: '#c0eacb',
          300: '#8dd4a0',
          400: '#55b872',
          500: '#2e9e52',
          600: '#1f7e3e',
          700: '#1a6434',
          800: '#184f2c',
          900: '#144125',
        },
        // 🟡 Warm — Haldi Yellow (energy, appetite)
        warm: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // 🟠 Spice — Mitti Orange (warmth, home)
        spice: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // 🤎 Earthy — Mitti Brown (grounded, homely)
        earthy: {
          50:  '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#65524a',
          900: '#271d1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'warm': '0 4px 24px rgba(249, 115, 22, 0.10)',
        'card': '0 2px 16px rgba(0,0,0,0.07)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
