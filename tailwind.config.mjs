/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          100: '#d4eaf7',
          200: '#b6ccd8',
          300: '#3b3c3d',
        },
        accent: {
          100: '#71c4ef',
          200: '#00668c',
        },
        text: {
          100: '#1d1c1c',
          200: '#313d44',
        },
        bg: {
          100: '#fffefb',
          200: '#f5f4f1',
          300: '#cccbc8',
        },
      },
    },
  },
  plugins: [],
};
