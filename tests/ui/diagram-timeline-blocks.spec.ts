import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { database, figures, pipeline, scope, states } from '../fixtures/timeline-blocks/figures';
import { blocksDrawing, timelineDrawing } from '../support/diagram-drawing';
import { figureOverflow, fitStates, openAt, sidewaysScroll, stateLabel, withScrollbars, type FitState } from '../support/diagrams';
import { root } from '../support/problems';

// Timeline and blocks figures that no Study page has yet: the approved mockups' fixture scopes and
// shared database, and what no mockup draws. They are a small site of their own in
// tests/fixtures/timeline-blocks, built into .tmp/ and served to the test from disk, so they never
// reach dist or the live site.

test.use(withScrollbars);

const out = join(root, '.tmp', 'timeline-blocks-fixture-test');
const origin = 'http://timeline-blocks-fixture.test';
const prefix = '/timeline-blocks-fixture/';

// One worker builds the fixture once and runs these in order.
test.describe.configure({ mode: 'default' });

test.beforeAll(() => {
  rmSync(out, { recursive: true, force: true });
  const build = spawnSync(process.execPath, [join(root, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'build',
    '--root', join(root, 'tests', 'fixtures', 'timeline-blocks'), '--outDir', out], { cwd: root, encoding: 'utf8' });
  if (build.status !== 0) throw new Error(`The fixture build failed:\n${build.stdout}\n${build.stderr}`);
});

async function open(page: Page, width: number, state: Partial<FitState> = {}) {
  await page.route(`${origin}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(out, pathname.replace(prefix, '/').replace(/\/$/, '/index.html'));
    return existsSync(file) ? route.fulfill({ path: file }) : route.fulfill({ status: 404, body: '' });
  });
  await openAt(page, `${origin}${prefix}`, { width, text: 100, ...state });
}

const figureOf = (page: Page, id: string) => page.locator(`figure[data-diagram]:has(> #dg-${id})`);
const tidy = (texts: string[]) => texts.map((text) => text.replace(/\s+/g, ' ').replace(/ ,/g, ',').trim());

/** Drawing problems of every fixture figure. */
async function drawingProblems(page: Page) {
  const found: string[] = [];
  for (const figure of [scope, states]) found.push(...(await page.evaluate(timelineDrawing, figure)).map((problem) => `${figure.id}: ${problem}`));
  for (const figure of [database, pipeline]) found.push(...(await page.evaluate(blocksDrawing, figure)).map((problem) => `${figure.id}: ${problem}`));
  return found;
}

async function expectNoViolations(page: Page, state: string) {
  const { violations, passes } = await new AxeBuilder({ page }).include('main').analyze();
  expect(passes.length, 'axe ran no checks').toBeGreaterThan(0);
  expect(violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(({ target }) => target.join(' ')) })), state).toEqual([]);
}

for (const state of fitStates) {
  test(`every figure fits and is drawn as its data says at ${stateLabel(state)}`, async ({ page }) => {
    await open(page, state.width, state);
    await expect(page.locator('figure[data-diagram]')).toHaveCount(figures.length);
    // At the default text size words keep inside their boxes; larger text may use the card padding, up to the edge.
    if (state.text === 100) expect(await page.evaluate(sidewaysScroll), 'no sideways page scroll').toBe(0);
    expect(await page.evaluate(figureOverflow, state.text === 100), 'nothing crosses the card edge').toEqual([]);
    expect(await drawingProblems(page)).toEqual([]);
    if (!state.spacing) await expectNoViolations(page, stateLabel(state));
  });
}

test('the fixture scopes say the worker and tests of every bar', async ({ page }) => {
  await open(page, 1280);
  const figure = figureOf(page, 'scope');
  await expect(figure.getByRole('list')).toHaveCount(1);
  // The lane has no name of its own, so the figure's caption names its list.
  const rows = figure.getByRole('list', { name: `${scope.title} ${scope.note}` }).getByRole('listitem');
  expect(tidy(await rows.allTextContents())).toEqual([
    'Test or function in pytest, Worker 1, Test 1 only, Worker 1, Test 2 only, Worker 2, Test 3 only, Worker 2, Test 4 only',
    'Worker Playwright, Worker 1, from Test 1 to Test 2, Worker 2, from Test 3 to Test 4',
    'Session pytest with xdist, Worker 1, from Test 1 to Test 2, Worker 2, from Test 3 to Test 4',
  ]);
  // The heads are drawn for the eye: every bar already says its worker and tests.
  await expect(figure.locator('.dg-time-heads')).toHaveAttribute('aria-hidden', 'true');
  await expect(figure.getByText('Time →')).toHaveCount(0);
});

test('a time scale with groups says the group of every bar', async ({ page }) => {
  await open(page, 1280);
  const rows = figureOf(page, 'states').getByRole('listitem');
  expect(tidy(await rows.allTextContents())).toEqual(['Read, during Saving, Too early', 'Reads, from Saving to Saved, until Match']);
});

test('the shared database says each box, its parts and its link', async ({ page }) => {
  await open(page, 1280);
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

test('the arrow row says each link once and draws its arrows for the eye only', async ({ page }) => {
  for (const width of [1280, 320]) {
    await open(page, width);
    const figure = figureOf(page, 'pipeline');
    expect(tidy(await figure.locator('.dg-box-title').allTextContents()))
      .toEqual(['Build, hands over to Test', 'Test, hands over to Deploy', 'Deploy, writes to Log', 'Log']);
    const arrows = figure.getByText(/[→↓]/);
    await expect(arrows).toHaveText(['→', '→', '↓']);
    expect(await arrows.evaluateAll((elements) => elements.every((element) => element.closest('[aria-hidden="true"]')))).toBe(true);
    await expect(figure.getByRole('list').first().getByRole('listitem').filter({ has: page.locator('.dg-box-title') })).toHaveCount(3);
  }
});

test('with 200% text on a phone, an arrow between stacked boxes turns down', async ({ page }) => {
  await open(page, 320);
  const turned = () => figureOf(page, 'pipeline').locator('.dg-arrow-across').first()
    .evaluate((arrow) => getComputedStyle(arrow).transform);
  expect(await turned()).toBe('none');
  await open(page, 320, { text: 200 });
  // A quarter turn: matrix(cos 90, sin 90, -sin 90, cos 90, 0, 0).
  expect((await turned()).match(/-?[\d.]+(?:e-?\d+)?/g)!.slice(0, 4).map((value) => Math.round(Number(value)))).toEqual([0, 1, -1, 0]);
});

test('the checks report planted faults', async ({ page }) => {
  for (const [width, css, message] of [
    [1280, '.dg-time-group { translate: 40px; }', /scope: "Worker 1" is not over its columns/],
    [1280, '.dg-time-head:not(.dg-time-group) { translate: 10px; }', /scope: tick 1 is not over its column/],
    [320, '.dg-timeline { --dg-scale: repeat(4, minmax(0, 1fr)) !important; }', /scope: a bar of "\w+" (?:starts|ends) -?\d+px off the scale/],
    [1280, '.dg-arrow-across { translate: 0 300px; }', /pipeline: no arrow runs from "Build" to "Test"/],
    [1280, '.dg-arrow-across { display: none; }', /pipeline: no arrow runs from "Build" to "Test"/],
    [1280, '.dg-box[data-strong] .dg-part { background: none !important; }', /database: "Order for Test A" in "Server database" has the wrong emphasis/],
  ] as const) {
    await open(page, width);
    expect(await drawingProblems(page)).toEqual([]);
    await page.addStyleTag({ content: css });
    expect((await drawingProblems(page)).join('\n'), css).toMatch(message);
  }
  await open(page, 320, { text: 200 });
  expect(await drawingProblems(page)).toEqual([]);
  await page.addStyleTag({ content: '.dg-time-grid > .dg-time-group { grid-row: 1; }' });
  expect((await drawingProblems(page)).join('\n')).toContain('"Saving" overlaps "Saved"');
});

test('the fixture page checks its figures with the schema the site uses', () => {
  expect(readFileSync(join(root, 'tests', 'fixtures', 'timeline-blocks', 'src', 'pages', 'index.astro'), 'utf8'))
    .toContain('diagramSchema.array().parse(figures)');
});