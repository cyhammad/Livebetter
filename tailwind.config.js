module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        compass: "compass 2s infinite",
      },
      keyframes: {
        compass: {
          "0%, 100%": {
            transform: "rotate(90deg)",
            animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
            opacity: 1,
          },
          "25%": {
            opacity: 0.75,
          },
          "50%": {
            transform: "rotate(30deg)",
            animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
            opacity: 1,
          },
          "75%": {
            opacity: 0.75,
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/line-clamp")],
};
