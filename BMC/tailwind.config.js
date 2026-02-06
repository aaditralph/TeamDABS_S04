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
        sidebar: '#1e293b',
        success: '#10b981',
        danger: '#dc2626',
        warning: '#f59e0b'
      }
    },
  },
  plugins: [],
}
