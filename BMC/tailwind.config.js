/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
          light: '#3b82f6'
        },
        secondary: {
          DEFAULT: '#0891b2',
          dark: '#0e7490',
          light: '#22d3ee'
        },
        sidebar: '#0f172a',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
      }
    },
  },
  plugins: [],
}
