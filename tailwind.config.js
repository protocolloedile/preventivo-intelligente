/** @type {import('tailwindcss').Config} */
export default {
    content: [
          "./index.html",
          "./src/**/*.{js,ts,jsx,tsx}",
        ],
    safelist: [
          'bg-orange-50',
          'bg-orange-500',
          'bg-orange-600',
          'border-orange-300',
          'border-orange-500',
          'text-orange-600',
          'text-orange-700',
          'ring-orange-200',
          'ring-orange-500',
          'hover:bg-orange-600',
          'hover:border-orange-300',
          'focus:ring-orange-500',
        ],
    theme: {
          extend: {},
    },
    plugins: [],
}
