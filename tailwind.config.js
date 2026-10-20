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
      borderRadius: {
        card: '12px',
        button: '8px',
        input: '6px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px 0 rgba(0,0,0,0.04)',
        'card-hover': '0 4px 6px -1px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
