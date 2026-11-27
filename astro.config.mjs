import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { shikiConfig, xpath } from './src/lib/shiki-config.mjs';

export default defineConfig({
  site: 'https://kingiko.github.io',
  base: '/pom-proof',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [preact(), sitemap()],
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: { ...shikiConfig, langs: [xpath] },
  },
});
