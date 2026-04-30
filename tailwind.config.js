/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 霓虹色系 - 亮色用于发光效果
        neon: {
          blue: '#00D4FF',
          'blue-glow': 'rgba(0, 212, 255, 0.5)',
          purple: '#8B5CF6',
          'purple-glow': 'rgba(139, 92, 246, 0.5)',
          pink: '#EC4899',
          'pink-glow': 'rgba(236, 72, 153, 0.5)',
          green: '#10B981',
          'green-glow': 'rgba(16, 185, 129, 0.5)',
          orange: '#F59E0B',
          'orange-glow': 'rgba(245, 158, 11, 0.5)',
        },
        // 暗色背景色系
        dark: {
          900: '#0A0A0F',   // 最深背景
          850: '#0F0F14',   // 主背景
          800: '#14141C',   // 卡片背景
          750: '#1A1A24',   // 卡片背景变体
          700: '#22222E',   // 侧边栏
          600: '#2D2D3A',   // 输入框背景
          500: '#3A3A48',   // 边框
          400: '#55556A',   // 次要文字
          300: '#7777A0',   // 占位符
          200: '#9999B8',   // 次要文字
        },
        // 主色调（霓虹风格）
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'bounce-in': 'bounce-in 0.5s ease-out',
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.3), 0 0 20px rgba(0, 212, 255, 0.2)' },
          '100%': { boxShadow: '0 0 10px rgba(0, 212, 255, 0.6), 0 0 40px rgba(0, 212, 255, 0.4), 0 0 60px rgba(0, 212, 255, 0.2)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'neon-gradient': 'linear-gradient(135deg, #00D4FF 0%, #8B5CF6 50%, #EC4899 100%)',
        'neon-blue': 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)',
        'neon-purple': 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
        'neon-pink': 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.2)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
        'neon-pink': '0 0 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)',
        'neon-green': '0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.1) inset',
        'card-glow': '0 4px 30px rgba(0, 212, 255, 0.1), 0 0 1px rgba(0, 212, 255, 0.3) inset',
      },
    },
  },
  plugins: [],
}
