import { expect, test, type Page } from '@playwright/test';
import { discoverProblems, type DiscoveredProblem } from '../support/problems';
import { submitStructured } from '../support/workspace';

// Section 1 of .notes/practice-study-plan.md: Practice remembers the list a learner filtered, and
// Previous, Next, the position line, the way back and the header Practice link follow it. Without
// that list the workspace keeps its built links (catalog neighbours, plain "Back to practice").
const prefix = '/pom-proof/';
// The catalog order the build uses (src/lib/catalog.ts orderedProblems): title, then id.
const catalog = discoverProblems().sort((a, b) => a.data.title.localeCompare(b.data.title, 'en') || a.id.localeCompare(b.id, 'en'));
// The list's topic order (most problems first, then by name), so the first two are on screen.
const counts = new Map<string, number>();
for (const { data } of catalog) counts.set(data.topic, (counts.get(data.topic) ?? 0) + 1);
const topics = [...counts].sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b, 'en')).map(([topic]) => topic);
const pair = topics.slice(0, 2);
const listed = catalog.filter(({ data }) => pair.includes(data.topic));
const query = `topic=${encodeURIComponent(pair.join(','))}`;
const rowId = (problem: DiscoveredProblem) => `row-${problem.kind}-${problem.slug}`;

const filters = (page: Page) => page.getByRole('search', { name: 'Practice filters' });
const topicBox = (page: Page, topic: string) => filters(page).getByRole('group', { name: 'Topic' }).locator(`input[value="${topic}"]`);
const rows = (page: Page) => page.getByRole('table', { name: 'Practice problems' }).locator('tbody tr');
const row = (page: Page, problem: DiscoveredProblem) => page.locator(`tr#${rowId(problem)}`);
const neighbours = (page: Page) => page.getByRole('navigation', { name: 'Adjacent problems' });
const position = (page: Page) => neighbours(page).locator('[data-practice-position]');
const previous = (page: Page) => neighbours(page).locator('a[rel="prev"]');
const next = (page: Page) => neighbours(page).locator('a[rel="next"]');
const back = (page: Page) => neighbours(page).locator('a.practice-return');
const headerPractice = (page: Page) => page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Practice', exact: true });
const crumb = (page: Page) => page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Practice', exact: true });
const heading = (page: Page, problem: DiscoveredProblem) => page.getByRole('heading', { level: 1, name: problem.data.title });

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

/** Opens the list, checks the two most common topics, and returns their on-screen names. */
async function filterToPair(page: Page) {
  await page.goto('');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  const names: string[] = [];
  for (const topic of pair) {
    await topicBox(page, topic).check();
    const option = filters(page).locator('label.check-row', { has: page.locator(`input[value="${topic}"]`) });
    names.push((await option.locator('span').first().textContent())!.trim());
  }
  await expect.poll(() => new URL(page.url()).searchParams.get('topic')).toBe(pair.join(','));
  await expect(rows(page)).toHaveCount(listed.length);
  return names.join(', ');
}

/** The catalog neighbours the page was built with. */
function catalogNeighbours(problem: DiscoveredProblem) {
  const index = catalog.findIndex(({ id }) => id === problem.id);
  return { before: catalog[index - 1], after: catalog[index + 1] };
}

async function expectBuiltLinks(page: Page, problem: DiscoveredProblem) {
  const { before, after } = catalogNeighbours(problem);
  const index = catalog.findIndex(({ id }) => id === problem.id);
  await expect(position(page)).toHaveText(`All problems: ${index + 1} of ${catalog.length}`);
  if (before) await expect(previous(page)).toHaveText(before.data.title);
  else await expect(previous(page)).toBeHidden();
  if (after) await expect(next(page)).toHaveText(after.data.title);
  else await expect(next(page)).toBeHidden();
  await expect(back(page)).toHaveText('Back to practice');
  await expect(back(page)).toHaveAttribute('href', prefix);
  await expect(crumb(page)).toHaveAttribute('href', prefix);
}

test('the two-topic sample has at least three problems in a different order from the catalog', () => {
  expect(listed.length, `topics ${pair.join(' and ')}`).toBeGreaterThanOrEqual(3);
  expect(catalogNeighbours(listed[1]).after?.id, 'the second listed problem has another catalog neighbour').not.toBe(listed[2].id);
});

test('Next follows the filtered list and the way back restores the filters and the row', async ({ page }) => {
  const errors = watchErrors(page);
  const label = await filterToPair(page);
  await expect(rows(page).locator('.catalog-title a')).toHaveText(listed.map(({ data }) => data.title));

  await rows(page).nth(1).getByRole('link').click();
  await expect(heading(page, listed[1])).toBeVisible();
  await expect(position(page)).toHaveText(`${label}: 2 of ${listed.length}`);
  await expect(previous(page)).toHaveText(listed[0].data.title);
  await expect(next(page)).toHaveText(listed[2].data.title);
  await expect(crumb(page)).toHaveAttribute('href', `${prefix}?${query}#${rowId(listed[1])}`);

  await next(page).click();
  await expect(heading(page, listed[2])).toBeVisible();
  await expect(position(page)).toHaveText(`${label}: 3 of ${listed.length}`);
  await expect(previous(page)).toHaveText(listed[1].data.title);

  await page.getByRole('link', { name: `Back to ${label}`, exact: true }).click();
  await expect(page).toHaveURL(`${prefix}?${query}#${rowId(listed[2])}`);
  for (const topic of pair) await expect(topicBox(page, topic)).toBeChecked();
  await expect(rows(page)).toHaveCount(listed.length);
  await expect(row(page, listed[2])).toBeInViewport();
  await expect(row(page, listed[2])).toHaveAttribute('data-current', '');
  await expect(row(page, listed[2]).getByRole('link')).toBeFocused();
  await expect(page.locator('tr[data-current]')).toHaveCount(1);
  expect(errors, 'page errors').toEqual([]);
});

test('the header Practice link keeps the filters, the brand link does not, and Continue stays in the list', async ({ page }) => {
  const errors = watchErrors(page);
  // A topic whose first problem is not the catalog's first, so Continue visibly moves.
  const topic = topics.find((value) => catalog.find(({ data }) => data.topic === value) !== catalog[0])!;
  const first = catalog.find(({ data }) => data.topic === topic)!;
  const continueLink = page.getByRole('link', { name: /^Continue: / });

  await page.goto('');
  await expect(continueLink).toHaveAttribute('href', `${prefix}${catalog[0].path}`);
  await topicBox(page, topic).check();
  await expect(continueLink).toHaveAttribute('href', `${prefix}${first.path}`);
  await expect(headerPractice(page)).toHaveAttribute('href', `${prefix}?topic=${topic}`);

  await rows(page).first().getByRole('link').click();
  await expect(heading(page, first)).toBeVisible();
  await expect(headerPractice(page)).toHaveAttribute('href', `${prefix}?topic=${topic}`);
  await expect(page.getByRole('banner').getByRole('link', { name: 'POM Proof', exact: true })).toHaveAttribute('href', prefix);
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Questions', exact: true }).click();
  await expect(headerPractice(page)).toHaveAttribute('href', `${prefix}?topic=${topic}`);

  await headerPractice(page).click();
  await expect(topicBox(page, topic)).toBeChecked();
  await expect(rows(page)).toHaveCount(counts.get(topic)!);
  await expect(continueLink).toHaveAttribute('href', `${prefix}${first.path}`);
  expect(errors, 'page errors').toEqual([]);
});

test('a fresh visit, or a problem outside the list, keeps the catalog neighbours and plain links', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto(listed[1].path);
  await expect(heading(page, listed[1])).toBeVisible();
  await expectBuiltLinks(page, listed[1]);
  await expect(headerPractice(page)).toHaveAttribute('href', prefix);

  await filterToPair(page);
  const outside = catalog.find(({ data }) => !pair.includes(data.topic))!;
  await page.goto(outside.path);
  await expect(heading(page, outside)).toBeVisible();
  await expectBuiltLinks(page, outside);
  expect(errors, 'page errors').toEqual([]);
});

test('the first listed problem has no Previous and the last has no Next', async ({ page }) => {
  const errors = watchErrors(page);
  const label = await filterToPair(page);
  const last = listed.at(-1)!;

  await rows(page).last().getByRole('link').click();
  await expect(heading(page, last)).toBeVisible();
  await expect(position(page)).toHaveText(`${label}: ${listed.length} of ${listed.length}`);
  await expect(previous(page)).toHaveText(listed.at(-2)!.data.title);
  await expect(next(page)).toBeHidden();

  await back(page).click();
  await expect(row(page, last)).toBeInViewport();
  await rows(page).first().getByRole('link').click();
  await expect(heading(page, listed[0])).toBeVisible();
  await expect(position(page)).toHaveText(`${label}: 1 of ${listed.length}`);
  await expect(previous(page)).toBeHidden();
  await expect(next(page)).toHaveText(listed[1].data.title);
  expect(errors, 'page errors').toEqual([]);
});

test('with session storage blocked the list still filters and problem pages keep their built links', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      get() { throw new DOMException('Storage is blocked.', 'SecurityError'); },
    });
  });
  const errors = watchErrors(page);
  await filterToPair(page);
  // The list tells its own page about the rows, so Continue and the header link still follow it.
  await expect(page.getByRole('link', { name: /^Continue: / })).toHaveAttribute('href', `${prefix}${listed[0].path}`);
  await expect(headerPractice(page)).toHaveAttribute('href', `${prefix}?${query}`);

  await rows(page).nth(1).getByRole('link').click();
  await expect(heading(page, listed[1])).toBeVisible();
  await expectBuiltLinks(page, listed[1]);
  await expect(headerPractice(page)).toHaveAttribute('href', prefix);
  expect(errors, 'page errors').toEqual([]);
});

// Diagnosis problems are structured, so a wrong answer through the page makes one Attempted and it
// leaves an Unattempted list.
const diagnoses = catalog.filter(({ kind }) => kind === 'diagnosis') as Parameters<typeof submitStructured>[1][];

test('coming back to a row that has left the list points at the next row, or the one before the last', async ({ page }) => {
  expect(diagnoses.length, 'diagnosis problems for the Unattempted list').toBeGreaterThanOrEqual(4);
  const errors = watchErrors(page);
  const backLink = () => page.getByRole('link', { name: 'Back to Diagnosis, Unattempted', exact: true });
  await page.goto('?kind=diagnosis&status=unattempted');
  await expect(rows(page)).toHaveCount(diagnoses.length);

  await rows(page).nth(1).getByRole('link').click();
  await expect(heading(page, diagnoses[1])).toBeVisible();
  await submitStructured(page, diagnoses[1], 'decoy');
  await backLink().click();
  await expect(page).toHaveURL(new RegExp(`#${rowId(diagnoses[1])}$`));
  await expect(rows(page)).toHaveCount(diagnoses.length - 1);
  await expect(row(page, diagnoses[1])).toHaveCount(0);
  await expect(row(page, diagnoses[2])).toHaveAttribute('data-current', '');
  await expect(row(page, diagnoses[2]).getByRole('link')).toBeFocused();
  await expect(row(page, diagnoses[2])).toBeInViewport();

  const last = diagnoses.at(-1)!;
  await rows(page).last().getByRole('link').click();
  await expect(heading(page, last)).toBeVisible();
  await submitStructured(page, last, 'decoy');
  await backLink().click();
  await expect(row(page, last)).toHaveCount(0);
  await expect(row(page, diagnoses.at(-2)!)).toHaveAttribute('data-current', '');
  await expect(row(page, diagnoses.at(-2)!).getByRole('link')).toBeFocused();
  await expect(row(page, diagnoses.at(-2)!)).toBeInViewport();
  await expect(page.locator('tr[data-current]')).toHaveCount(1);
  expect(errors, 'page errors').toEqual([]);
});

test.describe('at 360px', () => {
  test.use({ viewport: { width: 360, height: 800 } });

  test('the folded filter summary and the title band count show a filter the header link restored', async ({ page }) => {
    const errors = watchErrors(page);
    const summary = page.locator('.filter-disclosure > summary');
    const count = page.locator('.title-band .page-meta');
    await page.goto(`?${query}`);
    await expect(rows(page)).toHaveCount(listed.length);
    // The folded disclosure hides the form from role queries, so its option names are read by CSS.
    const names: string[] = [];
    for (const topic of pair) {
      const option = page.locator('.filter-body label.check-row', { has: page.locator(`input[value="${topic}"]`) });
      names.push((await option.locator('span').first().textContent())!.trim());
    }
    await rows(page).first().getByRole('link').click();
    await expect(heading(page, listed[0])).toBeVisible();

    await headerPractice(page).click();
    await expect(rows(page)).toHaveCount(listed.length);
    await expect(summary).toBeVisible();
    await expect(summary).toHaveText(`Filters: ${names.join(', ')}`);
    await expect(count).toHaveText(`${listed.length} of ${catalog.length} problems`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), 'no sideways scroll at 360px').toBe(360);

    await page.getByRole('banner').getByRole('link', { name: 'POM Proof', exact: true }).click();
    await expect(rows(page)).toHaveCount(catalog.length);
    await expect(summary).toHaveText('Filters');
    await expect(count).toHaveText(`${catalog.length} problems`);
    expect(errors, 'page errors').toEqual([]);
  });
});
