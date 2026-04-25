/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
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
          DEFAULT: "#0B1C2C", // Deep navy (primary)
          50: "#F4F6F8",
          100: "#E6EAEF",
          200: "#C2CBD6",
          300: "#8C9AAB",
          400: "#556678",
          500: "#2D3E52",
          600: "#1A2B3F",
          700: "#0B1C2C",
          800: "#07131F",
          900: "#040A12",
        },
        gold: {
          DEFAULT: "#F2B340", // Punchier accent gold
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F2B340",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        ember: {
          DEFAULT: "#F26B1F", // Sunset orange — passion accent
          50:  "#FFF5EE",
          100: "#FFE4D1",
          200: "#FFC299",
          300: "#FF9D5C",
          400: "#FF7A2E",
          500: "#F26B1F",
          600: "#D45711",
          700: "#A8420A",
          800: "#7A2F08",
          900: "#4F1E05",
        },
        crimson: {
          DEFAULT: "#C9183B", // Brand intensity
          50:  "#FFF1F4",
          100: "#FFD9E0",
          200: "#FAA3B2",
          300: "#EE6B83",
          400: "#DC3F5C",
          500: "#C9183B",
          600: "#A50F2D",
          700: "#7E0921",
          800: "#560616",
          900: "#33040D",
        },
        plum: {
          DEFAULT: "#2D1A37", // Deep mood layer
          50:  "#F5EFF8",
          100: "#E5D7EC",
          200: "#C2A5D1",
          300: "#9670B0",
          400: "#684783",
          500: "#43295A",
          600: "#2D1A37",
          700: "#221328",
          800: "#150B19",
          900: "#0A050C",
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
        "slide-up": "slideUp 0.25s ease-out",
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
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      boxShadow: {
        "soft": "0 2px 20px -8px rgba(11, 28, 44, 0.08)",
        "soft-lg": "0 20px 60px -20px rgba(11, 28, 44, 0.15)",
        "glow-gold": "0 10px 40px -10px rgba(242, 179, 64, 0.55)",
        "glow-ember": "0 10px 40px -10px rgba(242, 107, 31, 0.55)",
        "glow-crimson": "0 10px 40px -10px rgba(201, 24, 59, 0.45)",
        "premium-lift": "0 24px 60px -24px rgba(45, 26, 55, 0.35), 0 6px 18px -8px rgba(242, 107, 31, 0.18)",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
        "gradient-passion":  "linear-gradient(135deg, #F26B1F 0%, #C9183B 100%)",
        "gradient-aurora":   "linear-gradient(135deg, #F2B340 0%, #F26B1F 60%, #C9183B 100%)",
        "gradient-premium":  "linear-gradient(135deg, #0B1C2C 0%, #2D1A37 50%, #43295A 100%)",
        "gradient-sunset":   "linear-gradient(180deg, rgba(242,179,64,0.18) 0%, rgba(242,107,31,0.08) 50%, transparent 100%)",
      },
    },
  },
  plugins: [],
};
