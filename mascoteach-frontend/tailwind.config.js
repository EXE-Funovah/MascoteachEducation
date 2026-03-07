/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    'bg-brand-navy', 'bg-brand-blue', 'bg-brand-mid', 'bg-brand-light',
    'text-brand-navy', 'text-brand-blue', 'text-brand-mid',
    'border-brand-navy', 'border-brand-blue', 'border-brand-mid',
    'ring-brand-navy', 'ring-brand-blue', 'ring-brand-mid',
    'from-brand-navy', 'from-brand-blue', 'from-brand-mid',
    'via-brand-navy', 'via-brand-blue',
    'to-brand-navy', 'to-brand-blue', 'to-brand-mid', 'to-brand-light',
    'hover:border-brand-mid', 'hover:text-brand-blue',
  ],
  theme: {
    extend: {
      colors: {
        /* Base surfaces */
        surface: '#FAFAFA',
        'surface-white': '#FFFFFF',
        'surface-blue': '#F0F9FF',
        'surface-violet': '#F5F3FF',
        'surface-pink': '#FFF1F2',
        'surface-teal': '#F0FDFA',
        'surface-amber': '#FFFBEB',
        'surface-peach': '#FFF5F0',
        'surface-lavender': '#F0EEFF',

        /* Ink / text */
        ink: '#0F172A',
        'ink-secondary': '#334155',
        'ink-muted': '#94A3B8',
        'ink-light': '#CBD5E1',

        /* Accent palette */
        'accent-sky': '#5BAED4',
        'accent-teal': '#2B7AB5',
        'accent-pink': '#A8D8EA',
        'accent-orange': '#FB923C',
        'accent-violet': '#2B7AB5',
        'accent-indigo': '#1B3A6B',
        'accent-emerald': '#34D399',

        /* Brand spectrum */
        'brand-navy': '#1B3A6B',
        'brand-blue': '#2B7AB5',
        'brand-mid': '#5BAED4',
        'brand-light': '#A8D8EA',

        /* Gradient stops */
        'grad-start': '#1B3A6B',
        'grad-mid': '#2B7AB5',
        'grad-end': '#5BAED4',
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.08', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-md': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.7', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'gamma-soft': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        'gamma-card': '0 4px 24px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'gamma-hover': '0 12px 48px rgba(27,58,107,0.12), 0 4px 12px rgba(27,58,107,0.08)',
        'gamma-float': '0 24px 64px rgba(27,58,107,0.14), 0 8px 24px rgba(27,58,107,0.08)',
        'gamma-btn': '0 4px 14px rgba(43,122,181,0.40), 0 1px 3px rgba(43,122,181,0.20)',
        'gamma-btn-hover': '0 6px 20px rgba(43,122,181,0.50), 0 2px 6px rgba(43,122,181,0.28)',
        'gamma-glow': '0 0 40px rgba(27,58,107,0.25), 0 0 80px rgba(27,58,107,0.10)',
        'card-pastel': '0 2px 16px rgba(0,0,0,0.04)',
      },
      animation: {
        marquee: 'marquee 35s linear infinite',
        'marquee-reverse': 'marquee-reverse 35s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'spin-slow': 'spin 20s linear infinite',
        'blob': 'blob 7s ease-in-out infinite',
        'scroll-hint': 'scroll-hint 1.5s ease-in-out infinite',
        'fade-slide-up': 'fadeSlideUp 0.35s ease-out forwards',
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        blob: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        'scroll-hint': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(8px)' },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1B3A6B 0%, #2B7AB5 50%, #5BAED4 100%)',
        'gradient-brand': 'linear-gradient(135deg, #2B7AB5 0%, #5BAED4 100%)',
        'gradient-warm': 'linear-gradient(135deg, #5BAED4 0%, #A8D8EA 100%)',
        'gradient-sky': 'linear-gradient(135deg, #A8D8EA 0%, #5BAED4 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #F0F9FF 0%, #E0F0FA 50%, #F0F8FF 100%)',
      },
    },
  },
  plugins: [],
};
