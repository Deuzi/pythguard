import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        accent:   '#e8ff4a',
        surface:  '#0f0f0f',
        surface2: '#161616',
        surface3: '#1c1c1c',
        border1:  '#1f1f1f',
        border2:  '#2a2a2a',
      },
      animation: {
        'fade-up':      'fade-up 0.5s ease both',
        'slide-in':     'slide-in 0.3s ease both',
        'flash-danger': 'flash-danger 1.6s ease-in-out infinite',
        'pulse-dot':    'pulse-dot 1.4s ease-in-out infinite',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'flash-danger': {
          '0%, 100%': { borderColor: 'rgba(239,68,68,0.25)' },
          '50%':      { borderColor: 'rgba(239,68,68,0.55)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
}

export default config