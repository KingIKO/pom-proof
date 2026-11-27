import { expect, test, type Page } from '@playwright/test';
import { practiceContextKey } from '../../src/lib/practice-context';
import { discoverProblems } from '../support/problems';

// A Practice page restored from the back-forward cache must store its own list again: another page
// may have stored a different one while it sat in the cache (Codex review on PR #24).
// Two things keep Playwright's default browser from using the cache, both seen on 2026-11-27 with
// Playwright 1.65.1: it launches Chromium with --disable-back-forward-cache, and its default headless
// shell never restored a page (notRestoredReasons: "masked") even without that switch. The full
// Chromium build in its new headless mode (channel "chromium", 159.0.8154.6) restored every page tried.
// Both are browser options, which Playwright only allows at the top of a file, hence this file.
// A cache restore fires no load event, so Back waits only for the commit.
test.use({ channel: 'chromium', launchOptions: { ignoreDefaultArgs: ['--disable-back-forward-cache'] } });

const prefix = '/pom-proof/';
const catalog = discoverProblems().sort((a, b) => a.data.title.localeCompare(b.data.title, 'en') || a.id.localeCompare(b.id, 'en'));
const counts = new Map<string, number>();
for (const { data } of catalog) counts.set(data.topic, (counts.get(data.topic) ?? 0) + 1);
const [topicA, topicB] = [...counts].sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b, 'en')).map(([topic]) => topic);
const listA = catalog.filter(({ data }) => data.topic === topicA);
const listB = catalog.filter(({ data }) => data.topic === topicB);

const box = (page: Page, topic: string) => page.getByRole('search', { name: 'Practice filters' }).getByRole('group', { name: 'Topic' })
  .locator(`input[value="${topic}"]`);
const rows = (page: Page) => page.getByRole('table', { name: 'Practice problems' }).locator('tbody tr');
const headerPractice = (page: Page) => page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Practice', exact: true });
const continueLink = (page: Page) => page.getByRole('link', { name: /^Continue: / });
const storedQuery = (page: Page) => page.evaluate((key) => JSON.parse(sessionStorage.getItem(key) ?? 'null')?.query ?? null, practiceContextKey);
const neighbours = (page: Page) => page.getByRole('navigation', { name: 'Adjacent problems' });

async function openList(page: Page, query: string) {
  await page.goto(query);
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
}

test('the two topics have different first problems and at least three problems each', () => {
  expect(listA.length).toBeGreaterThanOrEqual(3);
  expect(listB.length).toBeGreaterThanOrEqual(3);
  expect(listA[0].id).not.toBe(listB[0].id);
});

test('filter A, open a problem, header Practice, change to B, Back twice: the restored list A is what links follow', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Records whether each pageshow came from the back-forward cache.
  await page.addInitScript(() => {
    window.addEventListener('pageshow', (event) => { (window as Window & { restored?: boolean }).restored = event.persisted; });
  });

  await openList(page, `?topic=${topicA}`);
  await rows(page).first().getByRole('link').click();
  await expect(page.getByRole('heading', { level: 1, name: listA[0].data.title })).toBeVisible();
  await headerPractice(page).click();
  await expect(box(page, topicA)).toBeChecked();
  await box(page, topicB).check();
  await box(page, topicA).uncheck();
  await expect.poll(() => new URL(page.url()).searchParams.get('topic')).toBe(topicB);
  await expect.poll(() => storedQuery(page)).toBe(`topic=${topicB}`);

  await page.goBack({ waitUntil: 'commit' });
  await expect(page.getByRole('heading', { level: 1, name: listA[0].data.title })).toBeVisible();
  await page.goBack({ waitUntil: 'commit' });
  await expect(page).toHaveURL(`${prefix}?topic=${topicA}`);
  expect(await page.evaluate(() => (window as Window & { restored?: boolean }).restored), 'the list came back from the back-forward cache').toBe(true);

  await expect(box(page, topicA)).toBeChecked();
  await expect(rows(page)).toHaveCount(listA.length);
  await expect.poll(() => storedQuery(page)).toBe(`topic=${topicA}`);
  await expect(headerPractice(page)).toHaveAttribute('href', `${prefix}?topic=${topicA}`);
  await expect(continueLink(page)).toHaveAttribute('href', `${prefix}${listA[0].path}`);

  await rows(page).nth(1).getByRole('link').click();
  await expect(page.getByRole('heading', { level: 1, name: listA[1].data.title })).toBeVisible();
  await expect(neighbours(page).locator('[data-practice-position]')).toHaveText(new RegExp(`: 2 of ${listA.length}$`));
  await expect(neighbours(page).locator('a[rel="next"]')).toHaveText(listA[2].data.title);
  expect(errors, 'page errors').toEqual([]);
});

test('a persisted pageshow stores the list on screen again and updates the header link and Continue', async ({ page }) => {
  await openList(page, `?topic=${topicA}`);
  await expect.poll(() => storedQuery(page)).toBe(`topic=${topicA}`);

  // Another page stored list B while this one sat in the cache.
  await page.evaluate(({ key, items }) => sessionStorage.setItem(key, JSON.stringify({ v: 1, query: items.query, label: 'B', items: items.list })),
    { key: practiceContextKey, items: { query: `topic=${topicB}`, list: listB.map(({ id, data }) => [id, data.title]) } });
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: false })));
  expect(await storedQuery(page), 'an ordinary pageshow leaves the store alone').toBe(`topic=${topicB}`);

  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  await expect.poll(() => storedQuery(page)).toBe(`topic=${topicA}`);
  await expect(headerPractice(page)).toHaveAttribute('href', `${prefix}?topic=${topicA}`);
  await expect(continueLink(page)).toHaveAttribute('href', `${prefix}${listA[0].path}`);
});
