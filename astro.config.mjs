import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://satmanavyogitattoos.com',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
});
