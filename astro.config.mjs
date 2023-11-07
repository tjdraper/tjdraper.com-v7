import { defineConfig } from 'astro/config';
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
    site: 'https://tjdraper.github.io',
    base: '/tjdraper.com-v7',
    integrations: [
        mdx(),
        react(),
        tailwind(),
    ]
});
