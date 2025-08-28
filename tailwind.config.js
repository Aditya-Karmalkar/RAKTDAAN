/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
    './*.{js,jsx,ts,tsx}',
    './**/*.jsx'
  ],
  theme: { extend: {} },
  plugins: [],
};