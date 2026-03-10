// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://bautistacremona.github.io',
  base: '/phone-specs',
  vite: {
    plugins: [tailwindcss()]
  }
});