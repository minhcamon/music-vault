/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#15171C',
          card: '#1C1F26',
        },
        glass: {
          surface: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.14)',
          hover: 'rgba(255, 255, 255, 0.10)',
        },
        accent: {
          primary: '#7C86F5', // Tím Lam Ánh Kim
          primaryHover: '#6B76F3',
          bronze: '#D4A66A',  // Đồng Ánh Sáng (CHỈ dùng cho Lossless badges)
          bronzeBg: 'rgba(212, 166, 106, 0.12)',
        },
        text: {
          primary: '#EDEFF3',   // Sương Trắng
          secondary: '#8A9099', // Xám Khói
          muted: '#5A606B',
        }
      },
      fontFamily: {
        display: ['Syne', 'Plus Jakarta Sans', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glass-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.14)',
        'accent-glow': '0 0 20px rgba(124, 134, 245, 0.35)',
        'bronze-glow': '0 0 15px rgba(212, 166, 106, 0.25)',
      },
      backdropBlur: {
        xs: '4px',
        glass: '16px',
        heavy: '24px',
      }
    },
  },
  plugins: [],
}
