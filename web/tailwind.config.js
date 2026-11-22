/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Newsreader"', '"Georgia"', "serif"],
        sans: ['"Inter"', '"Segoe UI"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Consolas"', "monospace"],
      },
      colors: {
        obsidian: "#0b1114",
        panel: "#11191e",
        panelElevated: "#162128",
        hairline: "#24343e",
        arith: "#e06c38",
        est: "#eab308",
        ana: "#2dd4bf",
        dest: "#34d399",
      },
    },
  },
  plugins: [],
};
