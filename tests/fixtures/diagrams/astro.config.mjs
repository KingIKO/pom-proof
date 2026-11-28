import { defineConfig } from 'astro/config';

// A separate one-page site for diagram kinds that no Study page uses yet. Only the diagram tests build
// it, into .tmp/, so nothing here reaches the dist folder that GitHub Pages deploys.
export default defineConfig({
  root: import.meta.dirname,
  // Each test worker builds with a cache of its own (tests/support/fixture-site.ts).
  cacheDir: process.env.FIXTURE_CACHE ?? '../../../.tmp/diagram-fixture-cache',
  base: '/diagram-fixture',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
