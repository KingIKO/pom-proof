import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page } from '@playwright/test';
import { figures, scope } from '../fixtures/timeline-blocks/figures';
import { drawingProblems } from '../support/diagram-drawing';
import { expectNoViolations, figureOverflow, fitStates, sidewaysScroll, stateLabel, withScrollbars } from '../support/diagrams';
import { fixtureSite } from '../support/fixture-site';
import { root } from '../support/problems';

// Timeline and blocks figures that no Study page has yet: the approved mockups' fixture scopes and
// shared database, and what no mockup draws.

const test = fixtureSite('timeline-blocks');
test.use(withScrollbars);

// One worker builds the fixture once and runs these in order.
test.describe.configure({ mode: 'default' });

const figureOf = (page: Page, id: string) => page.locator(`figure[data-diagram]:has(> #dg-${id})`);
const tidy = (texts: string[]) => texts.map((text) => text.replace(/\s+/g, ' ').replace(/ ,/g, ',').trim());

/** Drawing problems of every fixture figure. */
async function allProblems(page: Page) {
  const found: string[] = [];
  for (const figure of figures) found.push(...(await drawingProblems(page, figure)).map((problem) => `${figure.id}: ${problem}`));
  return found;
}

for (const state of fitStates) {
  test(`every figure fits and is drawn as its data says at ${stateLabel(state)}`, async ({ page, open }) => {
    await open(state.width, state);
    await expect(page.locator('figure[data-diagram]')).toHaveCount(figures.length);
    // At the default text size words keep inside their boxes; larger text may use the card padding, up to the edge.
    if (state.text === 100) expect(await page.evaluate(sidewaysScroll), 'no sideways page scroll').toBe(0);
    expect(await page.evaluate(figureOverflow, state.text === 100), 'nothing crosses the card edge').toEqual([]);
    expect(await allProblems(page)).toEqual([]);
    if (!state.spacing) await expectNoViolations(page, 'main', stateLabel(state));
  });
}

test('the fixture scopes say the worker and tests of every bar', async ({ page, open }) => {
  await open(1280);
  const figure = figureOf(page, 'scope');
  await expect(figure.getByRole('list')).toHaveCount(1);
  // The lane has no name of its own, so the figure's title names its list.
  const rows = figure.getByRole('list', { name: scope.title, exact: true }).getByRole('listitem');
  expect(tidy(await rows.allTextContents())).toEqual([
    'Test or function in pytest, Worker 1, Test 1 only, Worker 1, Test 2 only, Worker 2, Test 3 only, Worker 2, Test 4 only',
    'Worker Playwright, Worker 1, from Test 1 to Test 2, Worker 2, from Test 3 to Test 4',
    'Session pytest with xdist, Worker 1, from Test 1 to Test 2, Worker 2, from Test 3 to Test 4',
  ]);
  // The heads are drawn for the eye: every bar already says its worker and tests.
  await expect(figure.locator('.dg-time-heads')).toHaveAttribute('aria-hidden', 'true');
  await expect(figure.getByText('Time →')).toHaveCount(0);
});

test('a time scale with groups says the group of every bar', async ({ page, open }) => {
  await open(1280);
  const rows = figureOf(page, 'states').getByRole('listitem');
  expect(tidy(await rows.allTextContents())).toEqual(['Read, during Saving, Too early', 'Reads, from Saving to Saved, ends at Match']);
});

test('the shared database says each box, its parts and its link', async ({ page, open }) => {
  await open(1280);
  const figure = figureOf(page, 'database');
  expect(tidy(await figure.locator('.dg-box-title').allTextContents())).toEqual(['Test A, saves to Server database', 'Test B, saves to Server database', 'Server database']);
  expect(tidy(await figure.locator('.dg-part > span').allTextContents())).toEqual(['Browser context', 'Browser context', 'Order for Test A', 'Order for Test B']);
  expect(tidy(await figure.locator('.dg-part-items > li').allTextContents())).toEqual(['Cookies', 'Storage', 'Cookies', 'Storage']);
  // Containment is in the markup: each box is a list item that holds the list of its parts.
  const boxes = await figure.locator('.dg-box').evaluateAll((elements) => elements.map((element) => ({
    role: element.tagName, parts: [...element.querySelectorAll('.dg-part')].every((part) => part.closest('ul')!.closest('li') === element),
  })));
  expect(boxes).toEqual(Array(3).fill({ role: 'LI', parts: true }));
});

test('the arrow row says each link once and draws its arrows for the eye only', async ({ page, open }) => {
  for (const width of [1280, 320]) {
    await open(width);
    const figure = figureOf(page, 'pipeline');
    expect(tidy(await figure.locator('.dg-box-title').allTextContents()))
      .toEqual(['Build, hands over to Test', 'Test, hands over to Deploy', 'Deploy, writes to Log', 'Log']);
    const arrows = figure.getByText(/[→↓]/).filter({ visible: true });
    await expect(arrows).toHaveText(['→', '→', '↓']);
    expect(await arrows.evaluateAll((elements) => elements.every((element) => element.closest('[aria-hidden="true"]')))).toBe(true);
    await expect(figure.getByRole('list').first().getByRole('listitem').filter({ has: page.locator('.dg-box-title') })).toHaveCount(3);
  }
});

test('with 200% text on a phone, an arrow between stacked boxes points down', async ({ page, open }) => {
  await open(320);
  const arrows = figureOf(page, 'pipeline').getByText(/[→↓]/).filter({ visible: true });
  await expect(arrows).toHaveText(['→', '→', '↓']);
  await open(320, { text: 200 });
  // The same character as the arrow down to the log, so both come from one font.
  await expect(arrows).toHaveText(['↓', '↓', '↓']);
  expect(await arrows.evaluateAll((elements) => elements.map((element) => getComputedStyle(element).transform))).toEqual(['none', 'none', 'none']);
});

test('the checks report planted faults', async ({ page, open }) => {
  for (const [width, css, message] of [
    [1280, '.dg-time-group { translate: 40px; }', /scope: "Worker 1" is not over its columns/],
    [1280, '.dg-time-head:not(.dg-time-group) { translate: 10px; }', /scope: tick 1 is not over its column/],
    [320, '.dg-timeline { --dg-scale: repeat(4, minmax(0, 1fr)) !important; }', /scope: a bar of "\w+" (?:starts|ends) -?\d+px off the scale/],
    [1280, '.dg-arrow-across { translate: 0 300px; }', /pipeline: no arrow runs from "Build" to "Test"/],
    [1280, '.dg-arrow-across { display: none; }', /pipeline: no arrow runs from "Build" to "Test"/],
    [1280, '.dg-box[data-strong] .dg-part { background: none !important; }', /database: "Order for Test A" in "Server database" has the wrong emphasis/],
  ] as const) {
    await open(width);
    expect(await allProblems(page)).toEqual([]);
    await page.addStyleTag({ content: css });
    expect((await allProblems(page)).join('\n'), css).toMatch(message);
  }
  await open(320, { text: 200 });
  expect(await allProblems(page)).toEqual([]);
  await page.addStyleTag({ content: '.dg-time-grid > .dg-time-group { grid-row: 1; }' });
  expect((await allProblems(page)).join('\n')).toMatch(/states: the group heads share one line only from 8.5rem[\s\S]*"Saving" overlaps "Saved"/);
  await open(320, { text: 200 });
  await page.addStyleTag({ content: '.dg-arrow-across > :first-child { display: inline !important; } .dg-arrow-across > :last-child { display: none !important; }' });
  expect((await allProblems(page)).join('\n')).toContain('pipeline: the arrow from "Build" points the wrong way');
  await open(320, { text: 200 });
  await page.addStyleTag({ content: '.dg-lane-rows > li { row-gap: 0 !important; }' });
  expect((await allProblems(page)).join('\n')).toContain('scope: "Worker" stands 0px over its bars');
  await open(320, { text: 200 });
  await page.addStyleTag({ content: '.dg-lane-rows { gap: 4px !important; }' });
  expect((await allProblems(page)).join('\n')).toContain('scope: "Worker" stands 4px over the next row');
  await open(360, { text: 150 });
  expect(await allProblems(page)).toEqual([]);
  await page.addStyleTag({ content: '.dg-time-grid > .dg-time-group { grid-column-end: -1 !important; }' });
  expect((await allProblems(page)).join('\n')).toContain('scope: the group heads share one line only from 8.5rem');
});

test('the fixture page checks its figures with the schema the site uses', () => {
  expect(readFileSync(join(root, 'tests', 'fixtures', 'timeline-blocks', 'src', 'pages', 'index.astro'), 'utf8'))
    .toContain('diagramSchema.array().parse(figures)');
});