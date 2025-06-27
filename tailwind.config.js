/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#1A1625',
        card: '#2C2538',
        border: '#3D3450',
        'primary-text': '#F3EAD3',
        'secondary-text': '#B8A88F',
        accent: '#6D214F',
        'accent-hover': '#7D315F',
        'accent-text': '#F0E68C',
        // Dark red, black, and white theme
        primary: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#DC2626', // Main red
          600: '#B91C1C',
          700: '#991B1B',
          800: '#7F1D1D',
          900: '#450A0A',
        },
        secondary: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Dark theme colors
        dark: {
          50: '#18181B',
          100: '#27272A',
          200: '#3F3F46',
          300: '#52525B',
          400: '#71717A',
          500: '#A1A1AA',
          600: '#D4D4D8',
          700: '#E4E4E7',
          800: '#F4F4F5',
          900: '#FAFAFA',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'red-gradient': 'linear-gradient(135deg, #6D214F 0%, #572864 100%)',
        'dark-gradient': 'linear-gradient(135deg, #1A1625 0%, #2C2538 100%)',
      },
      boxShadow: {
        'red': '0 4px 14px 0 rgba(109, 33, 79, 0.25)',
        'red-lg': '0 10px 25px -3px rgba(109, 33, 79, 0.3)',
        'dark': '0 4px 14px 0 rgba(0, 0, 0, 0.5)',
        'dark-lg': '0 10px 25px -3px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '.7',
          },
        },
        'glow': {
          'from': {
            'box-shadow': '0 0 20px rgba(109, 33, 79, 0.5)',
          },
          'to': {
            'box-shadow': '0 0 30px rgba(109, 33, 79, 0.8)',
          },
        },
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'lato': ['Lato', 'sans-serif'],
      },
      aspectRatio: {
        '9/16': '9 / 16',
      },
    },
  },
  plugins: [],
}