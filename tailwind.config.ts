import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211c",
        moss: "#2f5d50",
        clay: "#b66b4f",
        linen: "#f7f1e8",
        oat: "#e5dccf"
      }
    }
  },
  plugins: []
};

export default config;
