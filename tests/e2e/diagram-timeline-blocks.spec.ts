import { expect, test, type Page } from '@playwright/test';
import { blocksDrawing, timelineDrawing, type BlocksData, type TimelineData } from '../support/diagram-drawing';
import { doubleText, figureOverflow, textSpacing } from '../support/diagrams';
import { discoverStudyPages } from '../support/study';

// The timeline and blocks kinds on their Study pages (diagram spec, Timeline and Blocks): what a screen
// reader gets, that every part is drawn where the data puts it, and that nothing spills with wide text
// spacing. study.spec.ts checks placement, caption and fit for every kind.

const figures = discoverStudyPages().flatMap(({ path, frontmatter }) =>
  (Array.isArray(frontmatter.diagrams) ? frontmatter.diagrams as Array<TimelineData | BlocksData> : []).map((figure) => ({ path, figure })));
const drawn = figures.filter(({ figure }) => figure.type === 'timeline' || figure.type === 'blocks');
const waiting = 'study/automation-fundamentals/waiting-and-synchronisation/';
const pageObjects = 'study/framework-design/page-object-model/';

const drawingProblems = (page: Page, figure: TimelineData | BlocksData) => (figure.type === 'timeline'
  ? page.evaluate(timelineDrawing, figure as TimelineData)
  : page.evaluate(blocksDrawing, figure as BlocksData));
const tidy = (texts: string[]) => texts.map((text) => text.replace(/\s+/g, ' ').replace(/ ,/g, ',').trim());

async function open(page: Page, path: string, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

test('a Study page has a timeline and a Study page has blocks', () => {
  expect(new Set(drawn.map(({ figure }) => figure.type))).toEqual(new Set(['timeline', 'blocks']));
});

for (const { path, figure } of drawn) {
  for (const width of [1280, 360, 320]) {
    test(`/${path} draws ${figure.id} as its data says at ${width}px`, async ({ page }) => {
      await open(page, path, width);
      expect(await drawingProblems(page, figure)).toEqual([]);
      await page.addStyleTag({ content: textSpacing });
      expect(await page.evaluate(() => document.documentElement.scrollWidth), 'no sideways page scroll').toBe(width);
      expect(await page.evaluate(figureOverflow, false), 'wide text spacing').toEqual([]);
      expect(await drawingProblems(page, figure), 'wide text spacing').toEqual([]);
      await page.goto(path);
      await page.evaluate(doubleText);
      expect(await page.evaluate(figureOverflow, true), '200% text').toEqual([]);
      expect(await drawingProblems(page, figure), '200% text').toEqual([]);
    });
  }
}

for (const width of [1280, 320]) {
  test(`the waiting page timeline says each bar's start, end and outcome at ${width}px`, async ({ page }) => {
    await open(page, waiting, width);
    const figure = page.locator('figure[data-diagram="timeline"]');
    await expect(figure.getByRole('list')).toHaveCount(2);
    const rows = async (name: string) => tidy(await figure.getByRole('list', { name, exact: true }).getByRole('listitem').allTextContents());
    expect(await rows('Fast run')).toEqual(['Fixed pause, from the start until after App ready, Wastes time', 'Condition wait, from the start until App ready']);
    expect(await rows('Slow run')).toEqual(['Fixed pause, from the start until before App ready, Too short', 'Condition wait, from the start until App ready']);
    // No image and no second copy: what is drawn without words is hidden.
    await expect(figure.locator('svg, img, [role="img"]')).toHaveCount(0);
    await expect(figure.getByText('Time →')).toHaveAttribute('aria-hidden', 'true');
    expect(await figure.textContent(), 'no duration').not.toMatch(/\d\s*(?:ms|s|seconds?)\b/);
  });

  test(`the page object blocks say each panel, box and link at ${width}px`, async ({ page }) => {
    await open(page, pageObjects, width);
    const figure = page.locator('figure[data-diagram="blocks"]');
    const before = figure.getByRole('group', { name: 'Each test holds the locator', exact: true });
    const after = figure.getByRole('group', { name: 'Tests call one page object', exact: true });
    const boxes = async (panel: typeof before) => tidy(await panel.locator('.dg-box-title').allTextContents());
    expect(await boxes(before)).toEqual(['Test 1', 'Test 2', 'Test 3']);
    expect(await boxes(after)).toEqual(['Test 1, calls Sign-in page object', 'Test 2, calls Sign-in page object', 'Test 3, calls Sign-in page object', 'Sign-in page object']);
    for (const [panel, result] of [[before, '3 edits'], [after, '1 edit']] as const) {
      await expect(panel.locator('.dg-result')).toHaveText(result);
      // The result is the number of copies of the locator the panel draws.
      await expect(panel.getByRole('listitem').filter({ hasText: /^\s*Button locator\s*$/ })).toHaveCount(Number(result[0]));
    }
    await expect(figure.getByText(/[→↓]/).and(page.locator(':not([aria-hidden="true"] *, [aria-hidden="true"])'))).toHaveCount(0);
    await expect(figure.locator('svg, img, [role="img"]')).toHaveCount(0);
  });
}

test.describe('the drawing checks', () => {
  for (const [name, path, width, css, message] of [
    ['a bar that stops short of its moment', waiting, 1280, '[data-strong] > .dg-span { margin-inline-end: 24px !important; }', /a bar of "Condition wait" ends -\d+px off the scale/],
    ['a lane on its own scale', waiting, 1280, '.dg-lane + .dg-lane { --dg-scale: repeat(12, minmax(0, 1fr)); }', /off the scale/],
    ['a moment off its place', waiting, 1280, '.dg-moment-line { translate: 8px; }', /"App ready" stands 8px off its place/],
    ['a moment that stops after one row', waiting, 1280, '.dg-moment-line { block-size: 60px; }', /"App ready" does not run through its rows/],
    ['a moment label on the wrong side', waiting, 1280, '.dg-moment { translate: -90px; }', /the label "App ready" is on the wrong side/],
    ['an outcome away from its bar', waiting, 1280, '.dg-outcome { translate: -200px; }', /"Wastes time" is not right after its bar/],
    ['an outcome across the moment', waiting, 320, '.dg-outcome { white-space: nowrap; }', /"Too short" runs into the moment/],
    ['a row name across its bars', waiting, 320, '.dg-row-name { white-space: nowrap; }', /"Condition wait" runs into its bars/],
    ['a strong row told apart by nothing but its fill', waiting, 1280, '.dg-row-name > span { font-weight: 400 !important; }', /"Condition wait" has the wrong weight/],
    ['bars under 32px', waiting, 1280, '.dg-span { min-block-size: 12px !important; block-size: 12px; align-self: center !important; }', /a bar of "Fixed pause" is 12px tall/],
    ['a box wider than its neighbours', pageObjects, 1280, '.dg-box:first-child { margin-inline-end: 12px !important; }', /row 1 has uneven boxes/],
    ['a part outside its box', pageObjects, 1280, '.dg-part { translate: 0 60px; }', /"Button locator" is not inside "Test 1"/],
    ['an arrow off its box', pageObjects, 1280, '.dg-arrows-down { translate: 30px; }', /no arrow runs from "Test 1" to "Sign-in page object"/],
    ['result lines that are not level', pageObjects, 1280, '.dg-panel { align-content: start; grid-template-rows: auto auto auto !important; }', /the result lines are not level/],
    ['panels side by side on a phone', pageObjects, 360, '.dg-panels { grid-template-columns: 1fr 1fr !important; }', /the panels are not stacked/],
    ['a strong part told apart by nothing but its fill', pageObjects, 1280, '.dg-part, .dg-part * { font-weight: 400 !important; }', /"Button locator" in "Test 1" has the wrong emphasis/],
  ] as const) {
    test(`report ${name}`, async ({ page }) => {
      const type = path === waiting ? 'timeline' : 'blocks';
      const { figure } = drawn.find((entry) => entry.path === path && entry.figure.type === type)!;
      await open(page, path, width);
      expect(await drawingProblems(page, figure)).toEqual([]);
      await page.addStyleTag({ content: css });
      expect((await drawingProblems(page, figure)).join('\n')).toMatch(message);
    });
  }

  test('report data the page does not draw', async ({ page }) => {
    await open(page, waiting, 1280);
    const timeline = structuredClone(drawn.find(({ path }) => path === waiting)!.figure) as TimelineData;
    timeline.lanes[0].mark!.at = 4;
    timeline.lanes[1].entries[0].spans[0].to = 6;
    expect((await drawingProblems(page, timeline)).join('\n')).toMatch(/a bar of "Fixed pause" ends -\d+px off the scale[\s\S]*"App ready" stands -\d+px off its place/);
    await open(page, pageObjects, 1280);
    const blocks = structuredClone(drawn.find(({ path }) => path === pageObjects)!.figure) as BlocksData;
    blocks.panels![0].tiers[0][0].linkTo = { label: 'calls', target: 'none' };
    expect((await drawingProblems(page, blocks)).join('\n')).toContain('0 arrows for 1 links');
  });
});

test('both figures keep their edges and bars in a high-contrast theme', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  for (const [path, part] of [[waiting, '.dg-span'], [waiting, '.dg-moment-line'], [pageObjects, '.dg-box']] as const) {
    await page.goto(path);
    const edge = await page.locator(part).first().evaluate((element) => {
      const style = getComputedStyle(element);
      return { style: style.borderLeftStyle, width: parseFloat(style.borderLeftWidth), same: style.borderLeftColor === getComputedStyle(element.closest('figure')!).backgroundColor };
    });
    expect(edge.style, part).toBe('solid');
    expect(edge.width, part).toBeGreaterThan(0);
    expect(edge.same, `${part} stands out from the card`).toBe(false);
  }
});