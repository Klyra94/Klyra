/** @type {import('tailwindcss').Config} */
    module.exports = {
      content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
      ],
      theme: {
        extend: {
          colors: {
            'klyra-blue': '#ADD8E6',
            'klyra-white': '#FFFFFF',
            'klyra-gold': '#FFD700',
            'klyra-orange': '#FFA500',
          },
        },
      },
      plugins: [],
    }
