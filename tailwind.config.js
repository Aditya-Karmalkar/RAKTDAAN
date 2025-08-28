const { fontFamily } = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./index.html", "./src//*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        DEFAULT: "0 1px 4px rgba(0, 0, 0, 0.1)",
        hover: "0 2px 8px rgba(0, 0, 0, 0.12)",
      },
      colors: {
        primary: {
          DEFAULT: "#dc2626",
          hover: "#b91c1c",
          light: "#fca5a5",
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
        gray: colors.gray, // full gray palette
      },
      spacing: {
        "form-field": "16px",
        "section-sm": "24px",
        section: "32px",
        "section-lg": "48px",
      },
      fontSize: {
        h1: ["2rem", { fontWeight: "700", lineHeight: "1.2" }],
        h2: ["1.5rem", { fontWeight: "600", lineHeight: "1.3" }],
        body: ["1rem", { fontWeight: "400", lineHeight: "1.5" }],
      },
      animation: {
        "bounce-gentle": "bounce 2s infinite",
        "pulse-slow": "pulse 3s infinite",
      },
    },
  },
};
