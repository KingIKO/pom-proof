import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { shikiConfig, xpath } from './src/lib/shiki-config.mjs';

const base = '/pom-proof';

export default defineConfig({
  site: 'https://kingiko.github.io',
  base,
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [preact(), sitemap({ filter: (page) => !new URL(page).pathname.startsWith(`${base}/questions/fragments/`) })],
  markdown: {
    // A ```diagram fence is a Study diagram marker, split out by studyBodyParts; it is never code.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['diagram'] },
    shikiConfig: { ...shikiConfig, langs: [xpath] },
  },
});
