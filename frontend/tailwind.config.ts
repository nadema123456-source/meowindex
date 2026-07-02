import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fffdf8", // page background
        ink: "#403d4d", // primary text
        muted: "#8d8a99", // secondary text
        // soft pastels (custom names so we don't clobber Tailwind's `sky` scale)
        butter: "#fde68a",
        blossom: "#fbcfe8",
        babyblue: "#bfdbfe",
        mint: "#bbf7d0",
        lilac: "#ddd6fe",
        peach: "#fed7aa",
      },
      fontFamily: {
        display: ["var(--font-baloo)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 32px -16px rgba(90, 78, 120, 0.28)",
        // claymorphism: soft outer drop + subtle inner top-light and bottom-shade
        clay: "0 10px 24px -10px rgba(90, 78, 120, 0.35), inset 0 2px 0 rgba(255,255,255,0.8), inset 0 -6px 12px -6px rgba(90,78,120,0.18)",
        "clay-sm":
          "0 6px 16px -8px rgba(90, 78, 120, 0.3), inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -4px 8px -5px rgba(90,78,120,0.15)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.75rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "float-slow": "float 7s ease-in-out infinite",
        wiggle: "wiggle 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
