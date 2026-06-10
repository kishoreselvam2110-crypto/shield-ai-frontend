/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#050505",
          card: "rgba(15, 15, 20, 0.7)",
          border: "rgba(255, 255, 255, 0.1)"
        },
        neon: {
          cyan: "#00f0ff",
          pink: "#ff007f",
          green: "#39ff14",
          red: "#ff3131"
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"]
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite'
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px #00f0ff, 0 0 15px #00f0ff' },
          '50%': { boxShadow: '0 0 15px #ff007f, 0 0 30px #ff007f' }
        }
      }
    },
  },
  plugins: [],
}
