import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { discoverProblems, root } from '../support/problems';
import { discoverQuestions } from '../support/questions';
import { expandQuestion } from '../support/review';
import { discoverStudyPages, studyModulePaths } from '../support/study';
import { showStudyInNav } from '../../src/lib/site-nav';

const prefix = '/pom-proof/';
const problems = discoverProblems();
const questions = discoverQuestions();
const studyPages = discoverStudyPages();
const editorials = readdirSync(join(root, 'content', 'editorials')).filter((file) => file.endsWith('.md')).map((file) => file.slice(0, -3));
const tracks = readdirSync(join(root, 'content', 'tracks')).filter((file) => /\.ya?ml$/.test(file)).map((file) => file.replace(/\.ya?ml$/, ''));
const pages = [
  '', 'study/', 'questions/', 'tracks/', 'progress/',
  ...problems.map(({ path }) => path),
  ...editorials.map((id) => `editorials/${id}/`),
  ...questions.map(({ path }) => path),
  ...tracks.map((role) => `tracks/${role}/`),
  ...studyModulePaths(studyPages),
  ...studyPages.map(({ path }) => path),
];

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

/** The page's only h1 sits in the title band at the top of main, under a breadcrumb whose last entry is marked current. */
async function expectTitleBand(page: Page) {
  await expect(page.locator('h1'), 'one h1').toHaveCount(1);
  const band = page.locator('main > .title-band');
  await expect(band, 'a title band at the top of main').toHaveCount(1);
  expect(await band.evaluate((element) => element === element.parentElement!.firstElementChild), 'the title band comes first in main').toBe(true);
  await expect(band.locator('h1')).toBeVisible();
  const crumbs = band.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('listitem');
  await expect(crumbs.first()).toBeVisible();
  expect(await crumbs.count(), 'breadcrumb entries').toBeGreaterThanOrEqual(2);
  await expect(crumbs.last().locator('[aria-current="page"]')).toHaveCount(1);
}

test('every problem has a page and an editorial', () => {
  expect(problems.length).toBeGreaterThan(0);
  expect(editorials.sort()).toEqual(problems.map(({ slug }) => slug).sort());
});

test('there are question and track pages to load', () => {
  expect(questions.length, 'no question files').toBeGreaterThan(0);
  expect(tracks.sort(), 'one track per role').toEqual(['automation', 'manual-qa', 'sdet', 'senior']);
});

for (const url of pages) {
  test(`/${url} loads only from below the Pages base without errors`, async ({ page }) => {
    const network = observeRequests(page);
    const response = await page.goto(url);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expectTitleBand(page);
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link')).toHaveCount(showStudyInNav ? 5 : 4);
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

// The site is light only; a dark system preference must still get the working light page.
test('mobile navigation with a dark system preference, question disclosure, and access checks', async ({ page }) => {
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
  const question = questions.find(({ id }) => id === 'playwright/independent-checkout-contexts');
  expect(question, 'the sample question').toBeDefined();
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), 'the light canvas').toBe('rgb(245, 247, 252)');
  const oneLine = String(question!.frontmatter.oneLine);
  await page.getByRole('link', { name: 'Questions' }).click();
  const card = await expandQuestion(page, question!);
  expect(await page.evaluate(() => document.documentElement.scrollWidth), 'an expanded card fits 375px').toBe(375);
  await card.getByRole('link', { name: 'Open page', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: String(question!.frontmatter.title) })).toBeVisible();
  await expect(page.getByText(oneLine)).toBeHidden();
  await page.getByText('Show answer').click();
  await expect(page.getByText(oneLine)).toBeVisible();
  await page.getByRole('link', { name: 'Tracks' }).click();
  await expect(page.getByRole('heading', { name: 'QA automation' })).toBeVisible();
  await page.getByRole('link', { name: 'Progress' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible();
  await expect(page.getByText(`0 of ${problems.length} solved`)).toBeVisible();
  network.check();
});
