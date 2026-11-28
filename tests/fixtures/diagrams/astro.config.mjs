import { defineConfig } from 'astro/config';

// A separate one-page site for diagram kinds that no Study page uses yet. Only the diagram tests build
// it, into .tmp/, so nothing here reaches the dist folder that GitHub Pages deploys.
export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../../.tmp/diagram-fixture-cache',
  base: '/diagram-fixture',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
