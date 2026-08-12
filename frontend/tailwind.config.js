/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        irisyn: {
          bg: '#070A0F',
          surface: '#0D121A',
          elevated: '#111923',
          border: '#1E2936',
          primary: '#7C5CFF',
          primaryBright: '#9A83FF',
          secondary: '#35C9FF',
          textPrimary: '#F5F7FA',
          textSecondary: '#A7B0BC',
          textMuted: '#6F7B88',
          healthy: '#22C55E',
          warning: '#F59E0B',
          critical: '#EF4444',
          info: '#38BDF8',
          unknown: '#94A3B8',
        },
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          500: '#7C5CFF',
          600: '#6845F5',
          700: '#5230D8',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
