import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { lightPlusColors, lightPlusTheme } from './src/components/editor/light-plus.mjs';

const xpath = {
  name: 'xpath',
  scopeName: 'source.xpath',
  patterns: [
    { name: 'string.quoted.single.xpath', begin: "'", end: "'" },
    { name: 'string.quoted.double.xpath', begin: '"', end: '"' },
    { name: 'constant.numeric.xpath', match: '\\b\\d+(?:\\.\\d+)?\\b' },
    { name: 'entity.name.function.xpath', match: '\\b[\\w-]+(?=\\s*\\()' },
    { name: 'variable.other.xpath', match: '[@$][\\w:-]+' },
    { name: 'keyword.control.xpath', match: '\\b(?:and|or|div|mod)\\b' },
  ],
};

export default defineConfig({
  site: 'https://kingiko.github.io',
  base: '/pom-proof',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [preact(), sitemap()],
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: lightPlusTheme,
      langs: [xpath],
      wrap: null,
      transformers: [{
        name: 'pom-proof:code-surface',
        pre(node) {
          delete node.properties.style;
        },
        tokens(lines) {
          for (const tokens of lines) {
            for (const token of tokens) {
              const replacement = token.color && lightPlusColors[token.color.toLowerCase()];
              if (replacement) token.color = replacement;
            }
          }
        },
      }],
    },
  },
});
