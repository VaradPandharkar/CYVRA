import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        surface: "#0a0a0a",
        "surface-2": "#111111",
        "surface-3": "#1a1a1a",
        border: "#222222",
        "border-light": "#333333",
        muted: "#666666",
        "muted-light": "#888888",
        accent: "#ffffff",
        "accent-dim": "#cccccc",
        safe: "#ffffff",
        suspicious: "#aaaaaa",
        dangerous: "#555555",
      },
      backgroundImage: {
        "cyber-grid": `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        "glow-white": "radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, transparent 70%)",
      },
      backgroundSize: {
        "cyber-grid": "40px 40px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "scan-line": "scanLine 2s linear infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "ticker": "ticker 30s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255,255,255,0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(255,255,255,0.2)" },
        },
        ticker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      boxShadow: {
        "glow-sm": "0 0 10px rgba(255,255,255,0.05)",
        "glow-md": "0 0 20px rgba(255,255,255,0.08)",
        "glow-lg": "0 0 40px rgba(255,255,255,0.1)",
        "inner-glow": "inset 0 0 20px rgba(255,255,255,0.03)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
