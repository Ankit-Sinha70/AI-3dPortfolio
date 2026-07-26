import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
    integrations: [react(), tailwind()],
    output: 'static',
    site: 'https://ai-3d-portfolio-ankit-sinhas-projects.vercel.app',
});
