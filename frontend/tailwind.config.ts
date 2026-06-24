import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'cyber-bg': '#040a1a',
        'cyber-bg-2': '#060d22',
        'cyber-panel': '#0a1628',
        'cyber-border': '#0d2545',
        'neon-blue': '#00d4ff',
        'neon-blue-dim': '#0090bb',
        'electric-purple': '#8b5cf6',
        'electric-purple-dim': '#6d28d9',
        'cyber-green': '#00ff88',
        'cyber-green-dim': '#00cc6a',
        'threat-red': '#ff2244',
        'threat-red-dim': '#cc1133',
        'threat-orange': '#ff8800',
        'threat-yellow': '#ffcc00',
        'cyber-teal': '#00ffcc',
        'cyber-pink': '#ff00aa',
      },
      fontFamily: {
        'rajdhani': ['Rajdhani', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'orbitron': ['Orbitron', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'data-flow': 'dataFlow 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'border-flow': 'borderFlow 3s linear infinite',
        'glitch': 'glitch 0.5s ease infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.7', filter: 'brightness(1.4)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        dataFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        borderFlow: {
          '0%': { borderColor: '#00d4ff' },
          '33%': { borderColor: '#8b5cf6' },
          '66%': { borderColor: '#00ff88' },
          '100%': { borderColor: '#00d4ff' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
      },
      backgroundImage: {
        'cyber-grid': `
          linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1px, transparent 1px)
        `,
        'neon-gradient': 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 50%, #00ff88 100%)',
        'threat-gradient': 'linear-gradient(135deg, #ff2244 0%, #ff8800 100%)',
        'panel-gradient': 'linear-gradient(135deg, rgba(10,22,40,0.9) 0%, rgba(6,13,34,0.95) 100%)',
        'hero-gradient': 'radial-gradient(ellipse at center, #0a1628 0%, #040a1a 70%)',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.4), 0 0 40px rgba(0, 255, 136, 0.2)',
        'neon-red': '0 0 20px rgba(255, 34, 68, 0.4), 0 0 40px rgba(255, 34, 68, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glass-lg': '0 16px 64px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        'panel': '0 4px 24px rgba(0, 0, 0, 0.5), 0 0 1px rgba(0, 212, 255, 0.2)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}

export default config
