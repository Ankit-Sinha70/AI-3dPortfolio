/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
          extend: {
                  colors: {
                            bg: '#07090f',
                            accent: '#5eead4',
                            warm: '#ffd9a0',
                            text: '#f4f1ff',
                            'text-dim': '#8d8aa3',
                  },
                  fontFamily: {
                            display: ['Fraunces', 'serif'],
                            body: ['Inter', 'sans-serif'],
                            mono: ['JetBrains Mono', 'monospace'],
                  },
          },
    },
    plugins: [],
};
