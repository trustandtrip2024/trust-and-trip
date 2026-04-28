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
        tat: {
          teal: '#0E7C7B',
          'teal-deep': '#094948',
          'teal-mist': '#B5D4D4',
          cream: '#F5E6D3',
          'cream-warm': '#EFD9BD',
          orange: '#E87B3D',
          'orange-soft': '#F4A876',
          gold: '#C8932A',
          burnt: '#C2541C',
          charcoal: '#2A2A2A',
          slate: '#6B7280',
          paper: '#FBF7F1',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Fraunces', 'Georgia', 'serif'],
        serif:   ['var(--font-display)', 'Fraunces', 'Georgia', 'serif'],
        body:    ['var(--font-sans)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sans:    ['var(--font-sans)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm:   "4px",
        md:   "8px",
        sub:  "12px",
        card: "16px",
        pill: "9999px",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      transitionDuration: {
        "120": "120ms",
        "200": "200ms",
        "300": "300ms",
      },
      fontSize: {
        // Typography pass 1 (2026-04-29): fluid clamps for h1-h3, body
        // bump 15→16, lead bump 17→clamp(17,20), new prose token for
        // long-form. Tracking ladder codified across the heading scale.
        // Existing display-xl/lg/md preserved for back-compat with hero
        // components that already reference them.
        "display":     ["clamp(2rem, 4.2vw, 3.5rem)",       { lineHeight: "1.08", letterSpacing: "-0.02em"  }],
        "h1":          ["clamp(1.875rem, 3.2vw, 2.75rem)",  { lineHeight: "1.12", letterSpacing: "-0.018em" }],
        "h2":          ["clamp(1.5rem, 2.4vw, 2rem)",       { lineHeight: "1.18", letterSpacing: "-0.014em" }],
        "h3":          ["clamp(1.25rem, 1.8vw, 1.5rem)",    { lineHeight: "1.25", letterSpacing: "-0.01em"  }],
        "h4":          ["1.125rem",                         { lineHeight: "1.32", letterSpacing: "-0.005em" }],
        "lead":        ["clamp(1.0625rem, 1.2vw, 1.25rem)", { lineHeight: "1.55" }],
        "prose":       ["1.0625rem",                        { lineHeight: "1.7"  }],
        "body":        ["1rem",                             { lineHeight: "1.6"  }],
        "body-sm":     ["0.875rem",                         { lineHeight: "1.55" }],
        "meta":        ["0.8125rem",                        { lineHeight: "1.45" }],
        "eyebrow":     ["0.75rem",                          { lineHeight: "1.4", letterSpacing: "0.16em" }],
        "tag":         ["0.6875rem",                        { lineHeight: "1.4", letterSpacing: "0.12em" }],
        "display-xl":  ["clamp(3rem, 8vw, 6.5rem)",         { lineHeight: "0.95", letterSpacing: "-0.025em" }],
        "display-lg":  ["clamp(2.25rem, 5vw, 4.5rem)",      { lineHeight: "1",    letterSpacing: "-0.022em" }],
        "display-md":  ["clamp(1.875rem, 4vw, 3rem)",       { lineHeight: "1.05", letterSpacing: "-0.018em" }],
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
        "card": "0 4px 16px rgba(45,30,15,0.04), 0 1px 2px rgba(45,30,15,0.04)",
        "rail": "0 8px 32px rgba(45,30,15,0.08)",
        "hover": "0 8px 24px rgba(45,30,15,0.10)",
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
