import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { progressStorageKey } from '../../src/lib/contracts';
import { practiceSetsKey } from '../../src/lib/practice-sets';
import { discoverProblems, type DiscoveredProblem } from '../support/problems';

// Section 2 of .notes/practice-study-plan.md: a practice set is a saved filter with a name. A bare
// visit to the list applies the active set, and Previous, Next, the position line, the way back
// and Continue follow it under the set's name. Sets travel in progress exports.
const prefix = '/pom-proof/';
// The catalog order the build uses (src/lib/catalog.ts orderedProblems): title, then id.
const catalog = discoverProblems().sort((a, b) => a.data.title.localeCompare(b.data.title, 'en') || a.id.localeCompare(b.id, 'en'));
// The list's topic order (most problems first, then by name), so the first three are on screen.
const counts = new Map<string, number>();
for (const { data } of catalog) counts.set(data.topic, (counts.get(data.topic) ?? 0) + 1);
const topics = [...counts].sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b, 'en')).map(([topic]) => topic);
const pair = topics.slice(0, 2);
const third = topics[2];
const listed = catalog.filter(({ data }) => pair.includes(data.topic));
const query = `topic=${encodeURIComponent(pair.join(','))}`;
// A small topic for the solved-set test, so its attempts can be stored directly.
const small = topics.find((topic) => counts.get(topic)! >= 2 && counts.get(topic)! <= 4)!;
const smallListed = catalog.filter(({ data }) => data.topic === small);

const filters = (page: Page) => page.getByRole('search', { name: 'Practice filters' });
const topicBox = (page: Page, topic: string) => filters(page).getByRole('group', { name: 'Topic' }).locator(`input[value="${topic}"]`);
const rows = (page: Page) => page.getByRole('table', { name: 'Practice problems' }).locator('tbody tr');
const setRow = (page: Page) => page.getByRole('group', { name: 'Practice sets' });
const picker = (page: Page) => page.getByRole('combobox', { name: 'Practice set' });
const button = (page: Page, name: string) => setRow(page).getByRole('button', { name, exact: true });
const nameField = (page: Page) => setRow(page).getByRole('textbox', { name: 'Set name' });
const status = (page: Page) => setRow(page).getByRole('status');
const neighbours = (page: Page) => page.getByRole('navigation', { name: 'Adjacent problems' });
const position = (page: Page) => neighbours(page).locator('[data-practice-position]');
const next = (page: Page) => neighbours(page).locator('a[rel="next"]');
const heading = (page: Page, problem: DiscoveredProblem) => page.getByRole('heading', { level: 1, name: problem.data.title });
const continueLink = (page: Page) => page.getByRole('link', { name: /^Continue: / });

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function openList(page: Page, path = '') {
  await page.goto(path);
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
}

const stored = (page: Page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null'), practiceSetsKey);

/** Checks the two most common topics and saves them as a set named after their on-screen labels. */
async function savePairAsSet(page: Page) {
  await openList(page);
  // Below 60rem the filters fold into a disclosure that starts closed.
  const summary = page.locator('.filter-disclosure > summary');
  if (await summary.isVisible()) await summary.click();
  const names: string[] = [];
  for (const topic of pair) {
    await topicBox(page, topic).check();
    const option = filters(page).locator('label.check-row', { has: page.locator(`input[value="${topic}"]`) });
    names.push((await option.locator('span').first().textContent())!.trim());
  }
  await expect(rows(page)).toHaveCount(listed.length);
  await button(page, 'Save as set').click();
  await expect(nameField(page)).toBeFocused();
  const name = `${names[0]} and ${names[1]}`;
  await nameField(page).fill(name);
  await button(page, 'Save set').click();
  await expect(status(page)).toHaveText('Set saved.');
  await expect(picker(page)).toBeFocused();
  await expect(picker(page).locator('option:checked')).toHaveText(name);
  return name;
}

test('the sample has two topics with at least three problems, a third topic and a small topic', () => {
  expect(listed.length).toBeGreaterThanOrEqual(3);
  expect(third, 'a third topic').toBeDefined();
  expect(small, 'a topic with two to four problems').toBeDefined();
});

test('with no sets and no filters there is no set row', async ({ page }) => {
  await openList(page);
  await expect(rows(page)).toHaveCount(catalog.length);
  await expect(setRow(page)).toHaveCount(0);
  await topicBox(page, pair[0]).check();
  await expect(button(page, 'Save as set')).toBeVisible();
  await expect(picker(page)).toHaveCount(0);
});

test('a saved set comes back on a bare visit, and Next follows it under its name', async ({ page, context }) => {
  const errors = watchErrors(page);
  const name = await savePairAsSet(page);
  expect(await stored(page)).toMatchObject({ version: 1, sets: [{ name, query }] });
  await expect.poll(async () => { const value = await stored(page); return value.activeId === value.sets[0].id; }).toBe(true);

  // A new tab starts with no list in session storage, so only the saved set can restore the filters.
  const fresh = await context.newPage();
  const freshErrors = watchErrors(fresh);
  await openList(fresh);
  await expect(fresh).toHaveURL(`${prefix}?${query}`);
  for (const topic of pair) await expect(topicBox(fresh, topic)).toBeChecked();
  await expect(rows(fresh)).toHaveCount(listed.length);
  await expect(picker(fresh).locator('option:checked')).toHaveText(name);
  await expect(continueLink(fresh)).toHaveAttribute('href', `${prefix}${listed[0].path}`);

  await rows(fresh).nth(1).getByRole('link').click();
  await expect(heading(fresh, listed[1])).toBeVisible();
  await expect(position(fresh)).toHaveText(`${name}: 2 of ${listed.length}`);
  await expect(neighbours(fresh).getByRole('link', { name: `Back to ${name}`, exact: true })).toBeVisible();
  await next(fresh).click();
  await expect(heading(fresh, listed[2])).toBeVisible();
  await expect(position(fresh)).toHaveText(`${name}: 3 of ${listed.length}`);

  await neighbours(fresh).getByRole('link', { name: `Back to ${name}`, exact: true }).click();
  await expect(picker(fresh).locator('option:checked')).toHaveText(name);
  expect([...errors, ...freshErrors], 'page errors').toEqual([]);
});

test('changed filters offer Update set and Save as new set, and names are checked', async ({ page }) => {
  const errors = watchErrors(page);
  const name = await savePairAsSet(page);
  await expect(button(page, 'Update set')).toHaveCount(0);

  await topicBox(page, third).check();
  await expect(button(page, 'Update set')).toBeVisible();
  await expect(button(page, 'Save as new set')).toBeVisible();
  await expect(button(page, 'Save as set')).toHaveCount(0);
  await expect(picker(page).locator('option:checked')).toHaveText(name);

  await button(page, 'Save as new set').click();
  await nameField(page).fill(` ${name.toUpperCase()} `);
  await button(page, 'Save set').click();
  await expect(setRow(page).getByText('A set with this name exists. Choose another name.')).toBeVisible();
  await expect(nameField(page)).toBeFocused();
  await expect(nameField(page)).toHaveAttribute('aria-invalid', 'true');
  await expect(nameField(page)).toHaveValue(` ${name.toUpperCase()} `);
  await nameField(page).fill('   ');
  await button(page, 'Save set').click();
  await expect(setRow(page).getByText('Enter a name for the set.')).toBeVisible();
  await nameField(page).fill('x'.repeat(41));
  await button(page, 'Save set').click();
  await expect(setRow(page).getByText('Use 40 characters or fewer. This name has 41.')).toBeVisible();
  await nameField(page).press('Escape');
  await expect(nameField(page)).toHaveCount(0);
  await expect(button(page, 'Save as new set')).toBeFocused();

  await button(page, 'Save as new set').click();
  await nameField(page).fill('Three topics');
  await button(page, 'Save set').click();
  await expect(status(page)).toHaveText('Set saved.');
  await expect(picker(page).locator('option:checked')).toHaveText('Three topics');
  await expect(picker(page).locator('option')).toHaveText(['All problems', name, 'Three topics']);

  // Choosing the first set puts its filters back; changing and updating it stores the new filters.
  await picker(page).selectOption({ label: name });
  await expect(topicBox(page, third)).not.toBeChecked();
  await expect(rows(page)).toHaveCount(listed.length);
  await filters(page).getByRole('searchbox').fill('find');
  await button(page, 'Update set').click();
  await expect(status(page)).toHaveText('Set updated.');
  await expect(button(page, 'Update set')).toHaveCount(0);
  expect((await stored(page)).sets[0].query).toBe(`q=find&${query}`);
  expect(errors, 'page errors').toEqual([]);
});

test('filters matching no set show as unsaved, and matching filters choose their set', async ({ page }) => {
  const name = await savePairAsSet(page);
  await picker(page).selectOption({ label: 'All problems' });
  await expect(page).toHaveURL(prefix);
  await expect(rows(page)).toHaveCount(catalog.length);
  await expect.poll(async () => (await stored(page)).activeId).toBeNull();

  await topicBox(page, third).check();
  await expect(picker(page).locator('option:checked')).toHaveText('Unsaved filters');
  await expect(button(page, 'Save as set')).toBeVisible();

  await topicBox(page, third).uncheck();
  await expect(picker(page).locator('option:checked')).toHaveText('All problems');
  // Checked in the other order, the same two topics list the same problems as the set.
  for (const topic of [...pair].reverse()) await topicBox(page, topic).check();
  await expect(picker(page).locator('option:checked')).toHaveText(name);
  await expect.poll(async () => { const value = await stored(page); return value.activeId === value.sets[0].id; }).toBe(true);

  await page.reload();
  await expect(rows(page)).toHaveCount(listed.length);
  await expect(picker(page).locator('option:checked')).toHaveText(name);
  await openList(page);
  await expect(page).toHaveURL(`${prefix}?${query}`);
});

test('Rename changes the name everywhere and Delete asks first, keeping the filters', async ({ page }) => {
  const errors = watchErrors(page);
  const name = await savePairAsSet(page);

  await button(page, 'Rename').click();
  await expect(nameField(page)).toHaveValue(name);
  await nameField(page).fill('My curriculum');
  await button(page, 'Rename set').click();
  await expect(status(page)).toHaveText('Set renamed.');
  await expect(button(page, 'Rename')).toBeFocused();
  await expect(picker(page).locator('option:checked')).toHaveText('My curriculum');
  await rows(page).first().getByRole('link').click();
  await expect(position(page)).toHaveText(`My curriculum: 1 of ${listed.length}`);
  await page.goBack();

  await button(page, 'Delete').click();
  await expect(setRow(page).getByText('Delete “My curriculum”? Your progress stays.')).toBeVisible();
  await expect(button(page, 'Keep set')).toBeFocused();
  await button(page, 'Keep set').click();
  await expect(button(page, 'Delete')).toBeFocused();
  expect((await stored(page)).sets).toHaveLength(1);

  await button(page, 'Delete').click();
  await button(page, 'Delete set').click();
  await expect(status(page)).toHaveText('Set deleted.');
  await expect(picker(page)).toHaveCount(0);
  await expect(button(page, 'Save as set')).toBeFocused();
  await expect(rows(page)).toHaveCount(listed.length);
  expect(await stored(page)).toEqual({ version: 1, activeId: null, sets: [] });

  await page.goto('');
  await expect(rows(page)).toHaveCount(catalog.length);
  expect(errors, 'page errors').toEqual([]);
});

test('Continue stays in the set and gives way to Set complete when all are solved', async ({ page }) => {
  await openList(page, `?topic=${small}`);
  await button(page, 'Save as set').click();
  await nameField(page).fill('Small set');
  await button(page, 'Save set').click();
  await expect(status(page)).toHaveText('Set saved.');
  await expect(continueLink(page)).toHaveAttribute('href', `${prefix}${smallListed[0].path}`);

  const solve = (problems: DiscoveredProblem[]) => page.evaluate(([key, ids]) => localStorage.setItem(key, JSON.stringify({
    version: 1, attempts: ids.map((problemId) => ({ problemId, completedAt: '2026-11-27T09:00:00.000Z', score: 1 })),
  })), [progressStorageKey, problems.map(({ id }) => id)] as const);

  await solve(smallListed.slice(0, -1));
  await page.goto('');
  await expect(continueLink(page)).toHaveAttribute('href', `${prefix}${smallListed.at(-1)!.path}`);
  await expect(page.getByText('Set complete.')).toHaveCount(0);

  await solve(smallListed);
  await page.reload();
  await expect(page.getByText('Set complete.')).toBeVisible();
  await expect(continueLink(page)).toHaveCount(0);

  // Without a set, solved filters only hide Continue.
  await picker(page).selectOption({ label: 'All problems' });
  await expect(page.getByText('Set complete.')).toHaveCount(0);
  await expect(continueLink(page)).toBeVisible();
});

test('another tab sees sets saved, renamed and deleted here', async ({ page, context }) => {
  const other = await context.newPage();
  await openList(other, `?topic=${third}`);
  await expect(picker(other)).toHaveCount(0);

  const name = await savePairAsSet(page);
  await expect(picker(other).locator('option')).toHaveText(['All problems', 'Unsaved filters', name]);
  await expect(rows(other)).toHaveCount(counts.get(third)!);

  await button(page, 'Rename').click();
  await nameField(page).fill('Renamed elsewhere');
  await button(page, 'Rename set').click();
  await expect(picker(other).locator('option')).toHaveText(['All problems', 'Unsaved filters', 'Renamed elsewhere']);

  await button(page, 'Delete').click();
  await button(page, 'Delete set').click();
  await expect(picker(other)).toHaveCount(0);
  await expect(button(other, 'Save as set')).toBeVisible();
});

test('with local storage blocked the set row is hidden and the list still filters', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() { throw new DOMException('Storage is blocked.', 'SecurityError'); },
    });
  });
  const errors = watchErrors(page);
  await openList(page);
  await topicBox(page, pair[0]).check();
  await expect(rows(page)).toHaveCount(counts.get(pair[0])!);
  await expect(setRow(page)).toHaveCount(0);
  expect(errors, 'page errors').toEqual([]);
});

test('export carries the sets, import restores them, and an older file keeps them', async ({ page }) => {
  const name = await savePairAsSet(page);
  const saved = await stored(page);

  await page.goto('progress/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export' }).click();
  const exported = readFileSync(await (await download).path(), 'utf8');
  const data = JSON.parse(exported);
  expect(data.version).toBe(1);
  expect(data.sets).toEqual(saved);

  await page.evaluate((key) => localStorage.removeItem(key), practiceSetsKey);
  const importFile = async (name: string, json: string) => {
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import' }).click();
    await (await chooser).setFiles({ name, mimeType: 'application/json', buffer: Buffer.from(json) });
  };
  await importFile('pom-proof-progress.json', exported);
  await expect(page.getByRole('status').filter({ hasText: /^Imported/ })).toHaveText('Imported 0 attempts and 1 practice set.');
  expect(await stored(page)).toEqual(saved);

  await importFile('old.json', JSON.stringify({ version: 1, attempts: [] }));
  await expect(page.getByRole('status').filter({ hasText: /^Imported/ })).toHaveText('Imported 0 attempts.');
  expect(await stored(page)).toEqual(saved);

  await importFile('bad.json', JSON.stringify({ version: 1, attempts: [], sets: { version: 1, sets: [{ id: 'x' }] } }));
  await expect(page.getByRole('status').filter({ hasText: /practice set/ })).toHaveText('The practice set data is invalid. Choose a POM Proof export.');
  expect(await stored(page)).toEqual(saved);

  await openList(page);
  await expect(rows(page)).toHaveCount(listed.length);
  await expect(picker(page).locator('option:checked')).toHaveText(name);
});

test.describe('at 360px', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test('the picker sits above the folded filters and nothing scrolls sideways', async ({ page }) => {
    const name = await savePairAsSet(page);
    await openList(page);
    await expect(rows(page)).toHaveCount(listed.length);
    await expect(picker(page)).toBeVisible();
    await expect(picker(page).locator('option:checked')).toHaveText(name);
    await expect(page.locator('.filter-disclosure > summary')).toBeVisible();
    const pickerBox = (await picker(page).boundingBox())!;
    const summaryBox = (await page.locator('.filter-disclosure > summary').boundingBox())!;
    expect(pickerBox.y, 'picker above the filter summary').toBeLessThan(summaryBox.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), 'no sideways scroll').toBe(360);

    await button(page, 'Delete').click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth), 'no sideways scroll with the confirm open').toBe(360);
  });
});
