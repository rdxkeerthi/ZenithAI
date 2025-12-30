/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './services/**/*.{js,ts,jsx,tsx,mdx}', // Included services just in case
  ],
  theme: {
    extend: {
      backdropBlur: {
        apple: "40px", // VisionOS uses heavy blur
      },
      borderRadius: {
        apple: "28px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)",
        'glass-hover': "0 16px 48px 0 rgba(0, 0, 0, 0.22), inset 0 0 0 1px rgba(255, 255, 255, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.4)",
        'glass-deep': "0 24px 64px rgba(0, 0, 0, 0.4)"
      },
      colors: {
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.4)", // Translucent white for glass
          dark: "rgba(20, 20, 20, 0.6)", // For dark mode
        }
      },
      animation: {
        'aurora': 'aurora 20s ease infinite alternate',
      },
      keyframes: {
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        }
      }
    },
  },
  plugins: [],
}
