import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kingiko.github.io',
  base: '/pom-proof',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [preact(), sitemap()],
  markdown: { syntaxHighlight: false },
});
