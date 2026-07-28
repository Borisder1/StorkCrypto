/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        'space-mono': ['"JetBrains Mono"', 'monospace'],
        sans: ['"JetBrains Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      zIndex: {
        'base': '0',
        'elevated': '10',
        'overlay': '20',
        'sticky': '30',
        'modal': '40',
        'toast': '50',
      },
      colors: {
        'surface-0': '#020617', // Deep Void
        'surface-1': '#0B1121', // Secondary Dark
        'surface-2': '#0F172A', // Card Surface
        'surface-3': '#1E293B', // Highlight Surface
        'brand-bg': '#020617',
        'brand-dark': '#0B1121',
        'brand-card': 'rgba(15, 23, 42, 0.85)',
        'brand-cyan': '#00F0FF',
        'brand-green': '#00FF9D',
        'brand-purple': '#BD00FF',
        'brand-danger': '#FF0055',
        'brand-warning': '#FBBF24',
        'brand-border': 'rgba(255, 255, 255, 0.08)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(0, 240, 255, 0.25)',
        'glow-md': '0 0 20px rgba(0, 240, 255, 0.35)',
        'glow-lg': '0 0 30px rgba(0, 240, 255, 0.5)',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 40s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 1s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0%)' }, '100%': { transform: 'translateX(-50%)' } },
        scanline: { '0%': { top: '-10%' }, '100%': { top: '110%' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        glitch: {
          '2%, 64%': { transform: 'translate(2px,0) skew(0deg)' },
          '4%, 60%': { transform: 'translate(-2px,0) skew(0deg)' },
          '62%': { transform: 'translate(0,0) skew(5deg)' }
        }
      }
    }
  },
  plugins: [],
}

