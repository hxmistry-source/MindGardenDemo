import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1d1b16",
        moss: "#3d5b3a",
        leaf: "#6f8f5c",
        petal: "#f1d1b4",
        clay: "#e6a77a",
        mist: "#f7f2eb",
      },
      boxShadow: {
        soft: "0 20px 60px -40px rgba(29, 27, 22, 0.45)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
