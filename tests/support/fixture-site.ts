import { spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { test as base } from '@playwright/test';
import { openAt, type FitState } from './diagrams';
import { root } from './problems';

/**
 * A one-page Astro site in tests/fixtures/<folder>, for figures no Study page has yet. A worker builds
 * it once into a folder of its own in .tmp/ and serves it to the test from disk, so two workers never
 * write to one folder and nothing reaches dist or the live site. `open` shows the page in a state, with
 * the figures the folder's data file exports.
 */
export function fixtureSite(folder: string) {
  const origin = `http://${folder}.test`;
  return base.extend<{ open: (width: number, state?: Partial<FitState>) => Promise<void> }, { site: string }>({
    site: [async ({}, use, { parallelIndex }) => {
      const out = join(root, '.tmp', 'fixture-sites', `${folder}-${parallelIndex}`);
      rmSync(out, { recursive: true, force: true });
      const build = spawnSync(process.execPath, [join(root, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'build',
        '--root', join(root, 'tests', 'fixtures', folder), '--outDir', join(out, 'site')], {
        cwd: root, encoding: 'utf8', env: { ...process.env, FIXTURE_CACHE: join(out, 'cache') },
      });
      if (build.status !== 0) throw new Error(`The fixture build failed:\n${build.stdout}\n${build.stderr}`);
      await use(join(out, 'site'));
    }, { scope: 'worker' }],
    open: async ({ page, site }, use) => {
      await page.route(`${origin}/**`, (route) => {
        const file = join(site, new URL(route.request().url()).pathname.replace(/^\/[^/]+/, '').replace(/\/$/, '/index.html'));
        return existsSync(file) ? route.fulfill({ path: file }) : route.fulfill({ status: 404, body: '' });
      });
      await use((width, state = {}) => openAt(page, `${origin}/${folder}/`, { width, text: 100, ...state }));
    },
  });
}
