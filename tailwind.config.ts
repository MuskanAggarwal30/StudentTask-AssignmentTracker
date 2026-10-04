import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { paper: "#fafaf8", ink: "#1f2328", muted: "#5c636b", line: "#dcdcd6", accent: "#3b4a9e" },
      borderRadius: { DEFAULT: "4px" },
    },
  },
  plugins: [],
};
export default config;
