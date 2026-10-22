/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1E3A5F',
          teal: '#0E9F8E',
          'teal-light': '#E6F7F5',
          'navy-light': '#E8F0F9',
        },
        surface: {
          primary: '#FFFFFF',
          secondary: '#F8FAFB',
          tertiary: '#F0F4F8',
        },
        status: {
          critical: '#C0392B',
          'critical-bg': '#FDECEA',
          high: '#E8A020',
          'high-bg': '#FEF3E2',
          moderate: '#D4AC0D',
          'moderate-bg': '#FEFBE6',
          low: '#2D9B6F',
          'low-bg': '#E8F6F0',
          ready: '#1A7A4A',
          'ready-bg': '#E3F5EB',
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
        },
        text: {
          primary: '#1A1A2E',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        display: ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        h1: ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        h2: ['1.375rem', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['1.0625rem', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['0.9375rem', { lineHeight: '1.6' }],
        caption: ['0.8125rem', { lineHeight: '1.4' }],
        micro: ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.04em' }],
      },
      borderRadius: {
        card: '12px',
        button: '8px',
        input: '6px',
        pill: '999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(15,23,42,0.06)',
        card: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px 0 rgba(0,0,0,0.04)',
        'card-hover': '0 4px 6px -1px rgba(0,0,0,0.08)',
        md: '0 6px 16px -4px rgba(15,23,42,0.12), 0 2px 4px -2px rgba(15,23,42,0.06)',
        lg: '0 20px 40px -12px rgba(15,23,42,0.18)',
      },
      backgroundImage: {
        'hero-gradient':
          'radial-gradient(circle at 15% 0%, rgba(14,159,142,0.10) 0%, rgba(14,159,142,0) 45%), radial-gradient(circle at 85% 10%, rgba(30,58,95,0.10) 0%, rgba(30,58,95,0) 50%)',
      },
    },
  },
  plugins: [],
}
