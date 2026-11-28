import { expect, test, type Locator, type Page } from '@playwright/test';
import { lineValues } from '../../src/lib/diagram-number-line';
import { drawingProblems, type NumberLineData } from '../support/diagram-drawing';
import { openAt, tightestWide, withScrollbars } from '../support/diagrams';
import { discoverStudyPages } from '../support/study';

// The number line kind (diagram spec, Number line): what a screen reader gets at each width, and that the
// drawing check reports planted faults. study.spec.ts checks placement and caption for every kind, and
// study-diagrams.spec.ts checks fit and drawing.

test.use(withScrollbars);

const pages = discoverStudyPages().flatMap(({ path, frontmatter }) =>
  (Array.isArray(frontmatter.diagrams) ? frontmatter.diagrams as NumberLineData[] : [])
    .filter(({ type }) => type === 'number-line').map((line) => ({ path, line })));

const valuesBetween = (line: NumberLineData, from: number, to: number) => {
  const { two, three } = lineValues(line);
  return Array.from({ length: to - from + 1 }, (_, index) => from + index)
    .map((value) => `${value}${two.includes(value) ? ', 2-value BVA' : three.includes(value) ? ', added by 3-value BVA' : ''}`);
};
/** The bands' labels. Which values each one holds is in the figure's description. */
const bandsBetween = (line: NumberLineData, from: number, to: number) => line.bands.filter((band) => band.from <= to && band.to >= from).map(({ label }) => label);

const linesOf = (page: Page) => page.locator('figure[data-diagram="number-line"]');
const listTexts = async (scope: Locator) => Promise.all((await scope.getByRole('list').all()).map((list) => list.getByRole('listitem').allTextContents()));
const tidy = (lists: string[][]) => lists.map((texts) => texts.map((text) => text.replace(/\s+/g, ' ').trim()));

test('at least one Study page has a number line', () => {
  expect(pages.length).toBeGreaterThan(0);
});

for (const { path, line } of pages) {
  const legend = ['2-value BVA', ...(line.threeValue ? ['3-value BVA adds'] : [])];

  const { min, max } = lineValues(line);

  for (const width of [1280, tightestWide.width]) {
    test(`/${path} reads the whole number line once at ${width}px`, async ({ page }) => {
      await openAt(page, path, { width, text: 100 });
      await expect(linesOf(page).getByRole('group')).toHaveCount(0);
      expect(tidy(await listTexts(linesOf(page)))).toEqual([
        legend, bandsBetween(line, min, max), valuesBetween(line, min, max),
      ]);
    });
  }

  for (const width of [360, 320]) {
    test(`/${path} reads one segment per edge at ${width}px`, async ({ page }) => {
      await openAt(page, path, { width, text: 100 });
      await expect(linesOf(page).getByRole('group')).toHaveCount(line.segments.length);
      expect(tidy(await listTexts(linesOf(page)))).toEqual([
        legend, ...line.segments.flatMap(({ from, to }) => [bandsBetween(line, from, to), valuesBetween(line, from, to)]),
      ]);
      for (const { title } of line.segments) await expect(linesOf(page).getByRole('group', { name: title, exact: true })).toBeVisible();
    });
  }
}

test('the description on the equivalence and boundaries page gives the ranges its table gives', async ({ page }) => {
  await openAt(page, 'study/test-design/equivalence-and-boundaries/', { width: 1280, text: 100 });
  await expect(linesOf(page).locator('> p')).toHaveText('The expected result is Reject for 9 or less, Accept for 10 through 20 and Reject for 21 or more.');
  await expect(page.locator('.study-body table').getByRole('row')).toContainText(['Partition', /9 or less[^]*Reject/, /10 through 20[^]*Accept/, /21 or more[^]*Reject/]);
});

test.describe('the drawing check', () => {
  for (const [name, width, css, message] of [
    ['a line that stops above the bands', 1280, '.dg-bands, .dg-values { grid-row: auto !important; }', /does not run through the bands and the values/],
    ['a line off its edge', 1280, '.dg-boundary { translate: 12px; }', /is not between 9 and 10/],
    ['a band short of its values', 1280, '.dg-bands > li { margin-inline-end: 40px !important; }', /the band over 5 to 9 does not cover its values/],
    ['checked values told apart by nothing but colour', 1280, '.dg-values [data-mark="two"] { background: none !important; color: red !important; }', /9 is not a filled box/],
    ['hollow boxes without an edge', 320, '.dg-values [data-mark="three"] { border: 0 !important; }', /8 is not a hollow box/],
    ['boxes that touch', 320, '.dg-values > li { inline-size: 120% !important; }', /is under 1px from/],
  ] as const) {
    test(`reports ${name}`, async ({ page }) => {
      const { path, line } = pages.find((entry) => entry.path === 'study/test-design/equivalence-and-boundaries/')!;
      await openAt(page, path, { width, text: 100 });
      expect(await drawingProblems(page, line)).toEqual([]);
      await page.addStyleTag({ content: css });
      expect((await drawingProblems(page, line)).join('\n')).toMatch(message);
    });
  }
});

test('the drawing check reports data the page does not draw', async ({ page }) => {
  const { path, line } = pages.find((entry) => entry.path === 'study/test-design/equivalence-and-boundaries/')!;
  await openAt(page, path, { width: 1280, text: 100 });
  const bands = line.bands.map((band, index) => ({ ...band, from: band.from + (index === 1 ? 1 : 0), to: band.to + (index === 0 ? 1 : 0) }));
  expect((await drawingProblems(page, { ...line, bands } as NumberLineData)).join('\n')).toMatch(/9 is a filled box[\s\S]*the line at 11 is not between 10 and 11/);
  expect((await drawingProblems(page, { ...line, threeValue: undefined } as NumberLineData)).join('\n')).toContain('8 is a hollow box');
  const renamed = line.bands.map((band) => ({ ...band, label: band.label === 'Accept' ? 'Allow' : band.label }));
  expect((await drawingProblems(page, { ...line, bands: renamed } as NumberLineData)).join('\n')).toContain('the bands over 5 to 25 are not Reject, Allow, Reject');
});

test('the number line keeps filled and hollow boxes apart in a high-contrast theme', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('study/test-design/equivalence-and-boundaries/');
  const styles = await page.evaluate(() => ['two', 'three'].map((mark) => {
    const style = getComputedStyle(document.querySelector(`.dg-line-wide [data-mark="${mark}"]`)!);
    return { background: style.backgroundColor, border: style.borderTopWidth };
  }));
  expect(styles[0].background, 'a filled box is filled').not.toBe(styles[1].background);
  expect(styles[1].border, 'a hollow box keeps its edge').toBe('2px');
});
