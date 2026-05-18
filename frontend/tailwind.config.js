/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rose: {
          powder: "#F4B8C1",
          light: "#FAE3E7",
          medium: "#E8909D",
          dark: "#C96B7A",
        },
        beige: {
          50: "#FDFAF5",
          100: "#F5F0E8",
          200: "#EDE4D3",
          300: "#D9C9B0",
        },
        dasha: {
          black: "#1A1A1A",
          gray: "#6B6B6B",
          "gray-light": "#F4F4F4",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 20px rgba(0,0,0,0.06)",
        card: "0 4px 24px rgba(0,0,0,0.08)",
        hover: "0 8px 40px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
