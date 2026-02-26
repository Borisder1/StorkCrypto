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
        'space-mono': ['"Space Mono"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'brand-bg': '#020617', // Deep Void (High Contrast)
        'brand-dark': '#0B1121', // Secondary Dark
        'brand-card': 'rgba(15, 23, 42, 0.85)', // Glass Panels
        'brand-cyan': '#00F0FF', // Cyber Cyan (Punchy)
        'brand-green': '#00FF9D', // Neon Mint
        'brand-purple': '#BD00FF', // Electric Purple
        'brand-danger': '#FF0055', // Cyber Red
        'brand-border': 'rgba(255, 255, 255, 0.08)',
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
