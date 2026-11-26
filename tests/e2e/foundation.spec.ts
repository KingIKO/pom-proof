import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { discoverProblems, root } from '../support/problems';

const prefix = '/pom-proof/';
const problems = discoverProblems();
const editorials = readdirSync(join(root, 'content', 'editorials')).filter((file) => file.endsWith('.md')).map((file) => file.slice(0, -3));
const pages = ['', 'questions/', 'tracks/', 'progress/', ...problems.map(({ path }) => path), ...editorials.map((id) => `editorials/${id}/`)];

/** Records every request, failure and page error so a page can prove it loaded only from below the base. */
function observeRequests(page: Page) {
  const requests: string[] = [];
  const failures: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('requestfailed', (request) => failures.push(`${request.url()} ${request.failure()?.errorText}`));
  page.on('response', (response) => {
    if (!response.ok() && response.status() !== 304) failures.push(`${response.status()} ${response.url()}`);
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return {
    requests,
    check() {
      expect(requests.length, 'no requests were recorded').toBeGreaterThan(0);
      expect(requests.filter((request) => {
        const url = new URL(request);
        if (url.protocol === 'blob:' || url.protocol === 'data:') return false;
        return url.origin !== new URL(page.url()).origin || !url.pathname.startsWith(prefix);
      }), 'requests outside the Pages base').toEqual([]);
      expect(failures, 'failed requests').toEqual([]);
      expect(errors, 'page errors').toEqual([]);
    },
  };
}

test('every problem has a page and an editorial', () => {
  expect(problems.length).toBeGreaterThan(0);
  expect(editorials.sort()).toEqual(problems.map(({ slug }) => slug).sort());
});

for (const url of pages) {
  test(`/${url} loads only from below the Pages base without errors`, async ({ page }) => {
    const network = observeRequests(page);
    const response = await page.goto(url);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link')).toHaveCount(4);
    await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
    network.check();
  });
}

test('the code worker and SQL WASM load below the Pages base', async ({ page }) => {
  const network = observeRequests(page);
  const sql = problems.find(({ kind }) => kind === 'sql');
  const code = problems.find(({ kind }) => kind === 'code');
  expect(sql && code, 'a SQL and a code problem exist').toBeTruthy();

  await page.goto(sql!.path);
  await expect(page.locator('.sql-schema')).toBeVisible();
  await page.goto(code!.path);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: /checks passed|Not graded/ })).toBeVisible();

  expect(network.requests.some((url) => /\/_astro\/js\.worker-[^/]*\.js$/.test(url)), 'code worker request').toBe(true);
  expect(network.requests.some((url) => /\/_astro\/sql-wasm-browser[^/]*\.wasm$/.test(url)), 'SQL WASM request').toBe(true);
  expect(await page.evaluate(() => crossOriginIsolated)).toBe(false);
  network.check();
});

test('an editorial page links back to its exercise', async ({ page }) => {
  const problem = problems.find(({ slug }) => editorials.includes(slug))!;
  await page.goto(`editorials/${problem.slug}/`);
  await expect(page.getByRole('heading', { name: `${problem.data.title}: solution`, level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to exercise' })).toHaveAttribute('href', `${prefix}practice/${problem.kind}/${problem.slug}/`);
});

test('mobile dark theme navigation, question disclosure, and access checks', async ({ page }) => {
  const network = observeRequests(page);
  await page.setViewportSize({ width: 375, height: 760 });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`${prefix}#main`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('link', { name: 'Questions' }).click();
  await page.getByText('Read the model answer').click();
  await expect(page.getByText('Use separate contexts', { exact: false })).toBeVisible();
  await page.getByRole('link', { name: 'Tracks' }).click();
  await expect(page.getByRole('heading', { name: 'QA automation' })).toBeVisible();
  await page.getByRole('link', { name: 'Progress' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible();
  await expect(page.getByText(`0 of ${problems.length} solved`)).toBeVisible();
  network.check();
});
