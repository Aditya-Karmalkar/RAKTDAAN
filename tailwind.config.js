const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
      },
      borderRadius: {
        DEFAULT: "8px",
        secondary: "4px",
        container: "12px",
      },
      boxShadow: {
        DEFAULT: "0 1px 4px rgba(0, 0, 0, 0.1)",
        hover: "0 2px 8px rgba(0, 0, 0, 0.12)",
      },
      colors: {
        primary: {
          DEFAULT: "#dc2626",   // 🔴 Red (base)
          hover: "#b91c1c",     // 🔴 Dark Red (hover)
          light: "#fca5a5",     // 🔴 Light Red (optional)
        },
        secondary: {
          DEFAULT: "#6B7280",
          hover: "#4B5563",
        },
        accent: {
          DEFAULT: "#8B5CF6",
          hover: "#7C3AED",
        },
        success: {
          DEFAULT: "#10B981",
          hover: "#059669",
        },
        warning: {
          DEFAULT: "#F59E0B",
          hover: "#D97706",
        },
      },
      spacing: {
        "form-field": "16px",
        section: "32px",
      },
      animation: {
        'bounce-gentle': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
    },
  },
  variants: {
    extend: {
      boxShadow: ["hover", "active"],
      transform: ["hover", "active"],
      scale: ["hover", "active"],
    },
  },
  safelist: [
    'rounded-container',
  ],
};
