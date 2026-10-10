import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Pages are static; only /api/* runs as a Vercel serverless function.
export default defineConfig({
  site: 'https://satmanavyogitattoos.com',
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap({ filter: (page) => !page.includes('/api/') })],
  build: { inlineStylesheets: 'auto' },
});
