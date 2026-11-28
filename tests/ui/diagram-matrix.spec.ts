import { spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { doubles, risk } from '../fixtures/diagrams/matrices';
import { figureOverflow, fitStates, openAt, overlappingHeads, sidewaysScroll, stateLabel, withScrollbars, type FitState } from '../support/diagrams';
import { root } from '../support/problems';

// The matrix kind (diagram spec, Matrix and Yes/no matrix) on a fixture page, because no Study page has
// one until its facts are sourced. The fixture is its own small site in tests/fixtures/diagrams, built
// into .tmp/ and served to the test from disk, so it never reaches dist or the live site.

test.use(withScrollbars);

const out = join(root, '.tmp', 'diagram-fixture-test');
const origin = 'http://diagram-fixture.test';
const prefix = '/diagram-fixture/';

// One worker builds the fixture once and runs these in order.
test.describe.configure({ mode: 'default' });

test.beforeAll(() => {
  rmSync(out, { recursive: true, force: true });
  const build = spawnSync(process.execPath, [join(root, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'build',
    '--root', join(root, 'tests', 'fixtures', 'diagrams'), '--outDir', out], { cwd: root, encoding: 'utf8' });
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

const figureOf = (page: Page, id: string) => page.locator(`figure[data-diagram="matrix"]:has(> #dg-${id})`);
const tidy = (texts: string[]) => texts.map((text) => text.replace(/\s+/g, ' ').trim());

async function expectNoViolations(page: Page, state: string) {
  const { violations, passes } = await new AxeBuilder({ page }).include('main').analyze();
  expect(passes.length, 'axe ran no checks').toBeGreaterThan(0);
  expect(violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(({ target }) => target.join(' ')) })), state).toEqual([]);
}

/** The figures whose box scrolls sideways. */
const scrolled = () => [...document.querySelectorAll('.dg-scroll')].filter((box) => box.scrollWidth > box.clientWidth)
  .map((box) => box.closest('figure')!.querySelector('figcaption')!.id.replace('dg-', ''));

/** The matrices that may scroll in their own box: the risk matrix at 320px with the overrides, and both with enlarged text on a phone (spec, narrow layouts). */
const mayScroll = ({ width, text, spacing }: FitState) => {
  if (width > 360) return [];
  return text > 100 ? ['risk', 'doubles'] : spacing && width === 320 ? ['risk'] : [];
};

for (const width of [1280, 360, 320]) {
  test(`the levels matrix is one table with its axes, levels and placed items at ${width}px`, async ({ page }) => {
    await open(page, width);
    const figure = figureOf(page, 'risk');
    const table = figure.getByRole('table');
    await expect(table).toHaveCount(1);
    await expect(figure.getByRole('table', { name: `${risk.title} ${risk.note}` })).toBeVisible();
    await expect(figure.locator('[role="img"], svg, img')).toHaveCount(0);
    await expect(table.getByRole('columnheader')).toHaveText([risk.columnAxis, risk.rowAxis, ...risk.columns]);
    await expect(table.locator('th[scope="colgroup"]')).toHaveText(risk.columnAxis);
    await expect(table.getByRole('rowheader')).toHaveText(risk.entries.map(({ head }) => head));
    for (const { head, cells } of risk.entries) {
      const row = table.getByRole('row').filter({ has: page.getByRole('rowheader', { name: head, exact: true }) });
      expect(tidy(await row.getByRole('cell').allInnerTexts()), head).toEqual(cells.map((word, index) =>
        [word, ...risk.placed.filter((item) => item.row === head && item.column === risk.columns[index]).map(({ label }) => label)].join(' ')));
      // Every cell writes its level, and High is bold, so shading carries nothing alone.
      expect(await row.locator('.dg-level').evaluateAll((words) => words.map((word) => [word.textContent, Number(getComputedStyle(word).fontWeight) >= 700])), head)
        .toEqual(cells.map((word) => [word, word === 'High']));
    }
  });

  test(`the answers matrix is read once at ${width}px, every answer with its item and question`, async ({ page }) => {
    await open(page, width);
    const figure = figureOf(page, 'doubles');
    const table = figure.getByRole('table', { name: `${doubles.title} ${doubles.note}` });
    await expect(table).toHaveCount(1);
    await expect(figure.getByRole('table')).toHaveCount(1);
    await expect(figure.locator('[role="img"], svg, img')).toHaveCount(0);
    const items = doubles.entries.map(({ head }) => head);
    // Each item and question heads the table once, whichever way it is turned.
    const heads = await table.locator('th').evaluateAll((list) => list.map((head) => [head.getAttribute('scope'), head.textContent!.trim()]));
    expect(heads).toEqual(width === 1280
      ? [...doubles.columns.map((text) => ['col', text]), ...items.map((text) => ['row', text])]
      : [...items.map((text) => ['col', text]), ...doubles.columns.map((text) => ['rowgroup', text])]);
    const answers = await table.evaluate((element, turned) => [...element.querySelectorAll('tbody td')].map((cell) => {
      const row = cell.parentElement as HTMLTableRowElement;
      const named = turned
        ? cell.getAttribute('headers')!.split(' ').map((id) => {
          const head = document.getElementById(id);
          return head?.closest('table') === element && head.tagName === 'TH' ? head.textContent!.trim() : `missing ${id}`;
        })
        : [row.querySelector('th[scope="row"]')!.textContent!.trim(), element.querySelectorAll('thead th')[(cell as HTMLTableCellElement).cellIndex - 1].textContent!.trim()];
      return `${named.join(', ')}: ${cell.textContent!.trim()}`;
    }), width !== 1280);
    expect(answers.sort()).toEqual(doubles.entries.flatMap(({ head, cells }) => cells.map((word, index) => `${head}, ${doubles.columns[index]}: ${word}`)).sort());
    // Every cell writes its answer, and only Yes is bold.
    expect((await table.locator('tbody td').evaluateAll((cells) => cells.map((cell) => [cell.textContent!.trim(), Number(getComputedStyle(cell).fontWeight) >= 700])))
      .filter(([word, bold]) => !word || bold !== (word === 'Yes'))).toEqual([]);
  });
}

for (const state of fitStates) {
  test(`both matrices fit at ${stateLabel(state)}`, async ({ page }) => {
    await open(page, state.width, state);
    const plain = state.text === 100 && !state.spacing;
    if (state.text === 100) expect(await page.evaluate(sidewaysScroll), 'no sideways page scroll').toBe(0);
    // At the default text size nothing may even use the card padding; larger text may, up to the edge.
    expect(await page.evaluate(figureOverflow, plain), 'nothing crosses the card edge').toEqual([]);
    expect(await page.evaluate(overlappingHeads)).toEqual([]);
    expect(await page.evaluate(scrolled), 'boxes that scroll').toEqual(mayScroll(state));
    if (!state.spacing) await expectNoViolations(page, stateLabel(state));
    for (const id of mayScroll(state)) {
      const box = figureOf(page, id).getByRole('group');
      await expect(box).toHaveCount(1);
      await box.focus();
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => box.evaluate((element) => element.scrollLeft), `a keyboard scrolls ${id}`).toBeGreaterThan(0);
    }
  });
}

test('the fit and overlap checks report planted faults', async ({ page }) => {
  await open(page, 320);
  expect(await page.evaluate(figureOverflow, true)).toEqual([]);
  await page.addStyleTag({ content: '.dg-matrix td { min-inline-size: 9rem; }' });
  expect((await page.evaluate(figureOverflow, true)).join('\n')).toMatch(/div\.dg-scroll .* holds content \d+px wider than its box/);
  await open(page, 320);
  expect(await page.evaluate(overlappingHeads)).toEqual([]);
  await page.addStyleTag({ content: '.dg-axis-side > span { inset-inline-start: 30px !important; }' });
  expect((await page.evaluate(overlappingHeads)).join('\n')).toContain('"Likelihood" overlaps "Low"');
});

test('a screen reader would meet the answers twice if both renderings showed', async ({ page }) => {
  await open(page, 1280);
  const tables = figureOf(page, 'doubles').getByRole('table');
  await expect(tables).toHaveCount(1);
  await page.addStyleTag({ content: '.dg-matrix-narrow { display: block !important; }' });
  await expect(tables).toHaveCount(2);
});
