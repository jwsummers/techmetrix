import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#121212",   // Main background color
        surface: "#1E1E1E",      // For cards/containers
        primaryText: "#F5F5F5",  // Main text color
        secondaryText: "#B0B0B0", // Secondary text color
        accent: "#1791c8",       // Primary accent (electric blue)
        tealAccent: "#14B8A6",   // Secondary accent
        orangeAccent: "#F59E0B", // Tertiary accent
        pinkAccent: "#EC4899" // Quaternary accent
      },
    },
  },
  plugins: [],
} satisfies Config;
