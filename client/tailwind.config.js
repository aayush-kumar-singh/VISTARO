/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '576px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#dc3545',
          hover: '#b02a37',
          light: '#fef2f2',
          border: '#fecaca',
        },
        ink: {
          DEFAULT: '#222222',
          muted: '#717171',
          light: '#a1a1aa',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          hover: '#F7F7F7',
          muted: '#F3F4F6',
        },
        border: '#DDDDDD',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.08)',
        'md': '0 2px 8px rgba(0, 0, 0, 0.12)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.16)',
        'card': '0 6px 16px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.35s ease-out forwards',
        'heart-pop': 'heartPop 0.38s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        heartPop: {
          '0%': { transform: 'scale(1)' },
          '35%': { transform: 'scale(1.45)' },
          '65%': { transform: 'scale(0.88)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
