module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        compass: "compass 1.85s infinite",
        "spin-slow": "spin 2s linear infinite",
      },
      keyframes: {
        compass: {
          "0%, 100%": {
            transform: "rotate(0deg)",
            animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
          },
          "50%": {
            transform: "rotate(-20deg)",
            animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/line-clamp")],
};
