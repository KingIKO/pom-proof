import { defineConfig } from 'astro/config';

// A one-page site with timeline and blocks figures that no Study page draws yet. Only the diagram tests
// build it, into .tmp/, so nothing here reaches the dist folder that GitHub Pages deploys.
export default defineConfig({
  root: import.meta.dirname,
  outDir: '../../../.tmp/timeline-blocks-fixture',
  // Each test worker builds with a cache of its own (tests/support/fixture-site.ts).
  cacheDir: process.env.FIXTURE_CACHE ?? '../../../.tmp/timeline-blocks-fixture-cache',
  base: '/timeline-blocks-fixture',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});