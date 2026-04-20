/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        ink: {
          DEFAULT: "#122B1C", // Deep forest green (logo)
          50: "#F2F7F4",
          100: "#E0EDE6",
          200: "#B8D4C4",
          300: "#7AAF94",
          400: "#3D8060",
          500: "#1E6B4A",
          600: "#175739",
          700: "#122B1C",
          800: "#0C1F15",
          900: "#07120D",
        },
        gold: {
          DEFAULT: "#E8471C", // Brand orange (logo)
          50: "#FFF4F0",
          100: "#FFE4D9",
          200: "#FFC4AA",
          300: "#FF9A73",
          400: "#F26238",
          500: "#E8471C",
          600: "#CC3A12",
          700: "#A82D0D",
          800: "#84220A",
          900: "#601807",
        },
        cream: "#FAF7F2",
        sand: "#EDE4D3",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-display)", "serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 8vw, 6.5rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.25rem, 5vw, 4.5rem)", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.875rem, 4vw, 3rem)", { lineHeight: "1.05", letterSpacing: "-0.015em" }],
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "fade-up": "fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slow-zoom": "slowZoom 20s ease-out infinite alternate",
        "marquee": "marquee 40s linear infinite",
        "shimmer": "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slowZoom: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        "soft": "0 2px 20px -8px rgba(11, 28, 44, 0.08)",
        "soft-lg": "0 20px 60px -20px rgba(11, 28, 44, 0.15)",
        "glow-gold": "0 10px 40px -10px rgba(245, 158, 11, 0.4)",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
