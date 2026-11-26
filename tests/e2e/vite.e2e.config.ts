import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import base from '../../vite.config.ts';

/*
  The app's own Vite config with a separate dependency cache. Vite 8 refuses a
  second dev server for the same root and config file, and a shared cache
  would let a developer's server and the e2e server rewrite the same
  optimized dependencies at once.
*/
export default mergeConfig(
  base,
  defineConfig({
    root: fileURLToPath(new URL('../..', import.meta.url)),
    cacheDir: 'node_modules/.vite-e2e',
  }),
);
