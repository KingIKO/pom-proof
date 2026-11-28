import { expect, test, type Locator, type Page } from '@playwright/test';
import { doubleText, textSpacing } from '../support/diagrams';
import { discoverStudyPages } from '../support/study';

// The number line kind (diagram spec, Number line): what a screen reader gets at each width, and that
// every mark, band and line is drawn where the data puts it. study.spec.ts checks placement, caption
// and fit for every kind.

interface NumberLine {
  type: string;
  min: number;
  max: number;
  bands: Array<{ from: number; to: number; label: string; kind: string }>;
  twoValue: number[];
  threeValue?: number[];
  segments: Array<{ title: string; from: number; to: number }>;
}
const pages = discoverStudyPages().flatMap(({ path, frontmatter }) =>
  (Array.isArray(frontmatter.diagrams) ? frontmatter.diagrams as NumberLine[] : [])
    .filter(({ type }) => type === 'number-line').map((line) => ({ path, line })));

/** The tightest wide layout: at 626px the figure is 34rem wide inside its padding. */
const tightest = 626;

const valuesBetween = (line: NumberLine, from: number, to: number) => Array.from({ length: to - from + 1 }, (_, index) => {
  const value = from + index;
  return `${value}${line.twoValue.includes(value) ? ', 2-value BVA' : line.threeValue?.includes(value) ? ', added by 3-value BVA' : ''}`;
});
const bandsBetween = (line: NumberLine, from: number, to: number) => line.bands.filter((band) => band.from <= to && band.to >= from)
  .map((band) => `${band.label}, ${Math.max(band.from, from)} to ${Math.min(band.to, to)}`);

/** Problems with what each visible line draws. Runs in the page. */
function drawingProblems(line: Pick<NumberLine, 'bands' | 'twoValue' | 'threeValue'>) {
  const found: string[] = [];
  const drawn = [...document.querySelectorAll('.dg-line')].filter((element) => element.getBoundingClientRect().width > 0);
  if (!drawn.length) found.push('no line is visible');
  const probe = document.createElement('div');
  probe.style.color = 'var(--dg-mark)';
  document.querySelector('figure[data-diagram]')!.append(probe);
  const ink = getComputedStyle(probe).color;
  probe.remove();
  for (const element of drawn) {
    const box = (part: Element) => part.getBoundingClientRect();
    const items = [...element.querySelectorAll('.dg-values > li')];
    const numbers = items.map((item) => parseInt(item.textContent!, 10));
    // Values run left to right, or top to bottom where the text is enlarged on a phone.
    const upright = box(items[1]).top >= box(items[0]).bottom;
    const start = upright ? 'top' : 'left';
    const end = upright ? 'bottom' : 'right';
    const at = (value: number) => box(items[numbers.indexOf(value)]);
    items.forEach((item, index) => {
      if (index && box(item)[start] < box(items[index - 1])[end] + 1) found.push(`${numbers[index]} is under 1px from ${numbers[index - 1]}`);
      const style = getComputedStyle(item);
      const two = line.twoValue.includes(numbers[index]);
      const three = line.threeValue?.includes(numbers[index]) ?? false;
      const filled = style.backgroundColor === ink;
      const hollow = !filled && parseFloat(style.borderTopWidth) === 2 && style.borderTopColor === ink;
      if (filled !== two) found.push(`${numbers[index]} is ${filled ? '' : 'not '}a filled box`);
      if (hollow !== three) found.push(`${numbers[index]} is ${hollow ? '' : 'not '}a hollow box`);
      if ((two || three) !== Number(style.fontWeight) >= 700) found.push(`${numbers[index]} has the wrong weight`);
    });
    const bands = [...element.querySelectorAll('.dg-bands > li')];
    for (const band of bands) {
      const [, from, to] = /, (-?\d+) to (-?\d+)$/.exec(band.textContent!.trim())!.map(Number);
      if (!(box(band)[start] <= at(from)[start] + 4 && box(band)[end] >= at(to)[end] - 4)) found.push(`the band over ${from} to ${to} does not cover its values`);
    }
    const rules = line.bands.slice(1).map(({ from }) => from).filter((from) => numbers.includes(from) && numbers.includes(from - 1));
    const edges = [...element.querySelectorAll('.dg-boundary')];
    if (edges.length !== rules.length) found.push(`${edges.length} lines for ${rules.length} rule changes`);
    edges.forEach((edge, index) => {
      const [before, after, rect] = [at(rules[index] - 1), at(rules[index]), box(edge)];
      if (rect[end] - rect[start] !== 2) found.push(`the line at ${rules[index]} is ${rect[end] - rect[start]}px wide`);
      if (rect[start] < before[end] || rect[end] > after[start]) found.push(`the line at ${rules[index]} is not between ${rules[index] - 1} and ${rules[index]}`);
      // The line runs through both rows: from the bands' far side to the values' far side.
      const [side, far] = upright ? ['left', 'right'] as const : ['top', 'bottom'] as const;
      const parts = [...bands, ...items].map(box);
      if (rect[side] > Math.min(...parts.map((part) => part[side])) + 0.5 || rect[far] < Math.max(...parts.map((part) => part[far])) - 0.5) {
        found.push(`the line at ${rules[index]} does not run through the bands and the values`);
      }
    });
  }
  return found;
}

const linesOf = (page: Page) => page.locator('figure[data-diagram="number-line"]');
const listTexts = async (scope: Locator) => Promise.all((await scope.getByRole('list').all()).map((list) => list.getByRole('listitem').allTextContents()));
const tidy = (lists: string[][]) => lists.map((texts) => texts.map((text) => text.replace(/\s+/g, ' ').trim()));

test('at least one Study page has a number line', () => {
  expect(pages.length).toBeGreaterThan(0);
});

for (const { path, line } of pages) {
  const legend = ['2-value BVA', ...(line.threeValue ? ['3-value BVA adds'] : [])];

  for (const width of [1280, tightest]) {
    test(`/${path} reads the whole number line once at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expect(linesOf(page).getByRole('group')).toHaveCount(0);
      expect(tidy(await listTexts(linesOf(page)))).toEqual([
        legend, bandsBetween(line, line.min, line.max), valuesBetween(line, line.min, line.max),
      ]);
      expect(await page.evaluate(drawingProblems, line)).toEqual([]);
    });
  }

  for (const width of [360, 320]) {
    test(`/${path} reads one segment per edge at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expect(linesOf(page).getByRole('group')).toHaveCount(line.segments.length);
      expect(tidy(await listTexts(linesOf(page)))).toEqual([
        legend, ...line.segments.flatMap(({ from, to }) => [bandsBetween(line, from, to), valuesBetween(line, from, to)]),
      ]);
      for (const { title } of line.segments) await expect(linesOf(page).getByRole('group', { name: title, exact: true })).toBeVisible();
      expect(await page.evaluate(drawingProblems, line)).toEqual([]);
    });

    test(`/${path} draws the number line at ${width}px with 200% text and with wide text spacing`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await page.addStyleTag({ content: textSpacing });
      expect(await page.evaluate(drawingProblems, line), 'wide text spacing').toEqual([]);
      await page.goto(path);
      await page.evaluate(doubleText);
      expect(await page.evaluate(drawingProblems, line), '200% text').toEqual([]);
    });
  }
}

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
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      expect(await page.evaluate(drawingProblems, line)).toEqual([]);
      await page.addStyleTag({ content: css });
      expect((await page.evaluate(drawingProblems, line)).join('\n')).toMatch(message);
    });
  }
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
