import { expect, test, type Page } from '@playwright/test';
import { discoverStudyPages } from '../support/study';

// How Study concept diagrams fit (diagram spec, "Layer stack width limits" in
// docs/design/study-diagrams/spec.md). Placement and captions are checked in study.spec.ts.
//
// Playwright's default browser hides scrollbars, so a 320px window lends all 320px to the page. A
// desktop browser keeps 15px of it for the scrollbar (305px measured on 2026-11-28), and that gap hid
// a honeycomb bar 9.8px past the card edge at 200% text. This file shows scrollbars: a browser option,
// which Playwright only allows at the top of a file, so these checks live here.
test.use({ channel: 'chromium', launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } });

const withDiagrams = discoverStudyPages().filter(({ frontmatter }) => Array.isArray(frontmatter.diagrams));
const layerStackPages = withDiagrams.filter(({ frontmatter }) => (frontmatter.diagrams as Array<{ type: string }>).some(({ type }) => type === 'layer-stack'));

/** The SC 1.4.12 text-spacing overrides. */
const textSpacing = '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-block-end: 2em !important; }';

interface State {
  width: number;
  /** Text size as the browser's default font size, in percent of 16px. */
  text: 100 | 150 | 200;
  spacing?: boolean;
  /**
   * How far apart two bars with the same width may draw. The spec measured the fix drawing them equal
   * (spec, "Layer stack width limits", the 1280, 768, 360 and 320 rows), except for the limits it
   * accepts: 1.8px at 1024, 10px at 1280 with 200% text, and 3.3px at 1280 with the spacing overrides.
   * null: the spec records only the card edge for that state, so equal widths are not checked there.
   */
  sameWidthGap: number | null;
}
const states: State[] = [
  { width: 1280, text: 100, sameWidthGap: 0 },
  { width: 1024, text: 100, sameWidthGap: 1.8 },
  { width: 768, text: 100, sameWidthGap: 0 },
  { width: 360, text: 100, sameWidthGap: 0 },
  { width: 320, text: 100, sameWidthGap: 0 },
  { width: 360, text: 150, sameWidthGap: 0 },
  { width: 320, text: 150, sameWidthGap: 0 },
  { width: 360, text: 200, sameWidthGap: 0 },
  { width: 320, text: 200, sameWidthGap: 0 },
  { width: 1280, text: 200, sameWidthGap: 10 },
  { width: 1280, text: 100, spacing: true, sameWidthGap: 3.3 },
  // With both, a shape name such as Honeycomb can be the longest word and widen its own column, so its
  // bars use a wider scale (9.8px at width 5 on 2026-11-28). The spec accepts labels in the padding here.
  { width: 320, text: 200, spacing: true, sameWidthGap: null },
];
const label = ({ width, text, spacing }: State) => `${width}px${text === 100 ? '' : ` with ${text}% text`}${spacing ? ' and the text-spacing overrides' : ''}`;

/** Opens a page in a state: the browser's default font size first, so the page loads with it. */
async function open(page: Page, path: string, { width, text, spacing }: State) {
  await page.setViewportSize({ width, height: 900 });
  if (text !== 100) {
    const cdp = await page.context().newCDPSession(page);
    // Whole pixels only: CDP refuses 19.5. The fixed size sets code text, which no diagram uses.
    await cdp.send('Page.setFontSizes', { fontSizes: { standard: 16 * text / 100, fixed: Math.round(13 * text / 100) } });
  }
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  if (spacing) await page.addStyleTag({ content: textSpacing });
  // Without a scrollbar the page has 15px more room and these checks would pass on a layout nobody sees.
  expect(await page.evaluate(() => window.innerWidth - document.documentElement.clientWidth), 'the page shows its scrollbar').toBeGreaterThan(0);
}

/**
 * Parts that cross their figure's outer edge: elements, the text inside them, and drawn bars, which
 * may be a bar's own box or its ::after. With `strict`, also a box whose content is wider than it is.
 */
function figureOverflow(strict: boolean) {
  const name = (element: Element) => {
    const className = element.getAttribute('class');
    return `${element.tagName.toLowerCase()}${className ? `.${className.split(' ')[0]}` : ''} "${(element.textContent ?? '').trim().slice(0, 30)}"`;
  };
  return [...document.querySelectorAll('figure[data-diagram]')].flatMap((figure) => {
    const box = figure.getBoundingClientRect();
    const found: string[] = [];
    const past = (left: number, right: number) => Math.max(box.left - left, right - box.right);
    if (strict && figure.scrollWidth > figure.clientWidth) found.push(`${name(figure)} scrolls ${figure.scrollWidth - figure.clientWidth}px sideways`);
    for (const part of figure.querySelectorAll('*')) {
      if (part.closest('.visually-hidden')) continue;
      const rect = part.getBoundingClientRect();
      if (!rect.width && !rect.height) continue;
      // The element's own text, which can run past a box that is narrower than a long word.
      const ink = [...part.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()).map((node) => {
        const range = document.createRange();
        range.selectNode(node);
        const { left, right } = range.getBoundingClientRect();
        return past(left, right);
      });
      const over = Math.max(past(rect.left, rect.right), ...ink);
      if (over > 0.5) found.push(`${name(part)} passes the card edge by ${over.toFixed(1)}px`);
      if (strict && part.clientWidth && part.scrollWidth > part.clientWidth + 1) found.push(`${name(part)} holds content ${part.scrollWidth - part.clientWidth}px wider than its box`);
      const after = getComputedStyle(part, '::after');
      if (after.content !== 'none' && after.content !== 'normal') {
        const width = parseFloat(after.width);
        const centre = rect.left + rect.width / 2;
        const barOver = past(centre - width / 2, centre + width / 2);
        if (barOver > 0.5) found.push(`${name(part)} draws its bar past the card edge by ${barOver.toFixed(1)}px`);
      }
    }
    return found;
  });
}

/** Every bar of every layer stack, as drawn: its own box, or its ::after when the label sits above it. */
function drawnBars() {
  return [...document.querySelectorAll('figure[data-diagram="layer-stack"]')].map((figure) => {
    const style = getComputedStyle(figure);
    const content = figure.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return {
      content,
      rem,
      sideBySide: new Set([...figure.querySelectorAll('.dg-shape')].map((shape) => Math.round(shape.getBoundingClientRect().top))).size === 1,
      shapes: figure.querySelectorAll('.dg-shape').length,
      bars: [...figure.querySelectorAll('.dg-shape')].flatMap((shape) => [...shape.querySelectorAll('.dg-layers > li')].map((bar) => {
        const after = getComputedStyle(bar, '::after');
        const thin = after.content !== 'none' && after.content !== 'normal';
        return {
          name: `${(shape.querySelector('.dg-shape-name')?.textContent ?? '').trim()} ${(bar.querySelector('span')?.textContent ?? '').trim()}`,
          data: Number(bar.getAttribute('data-width')),
          drawn: thin ? parseFloat(after.width) : bar.getBoundingClientRect().width,
          thin,
        };
      })),
    };
  });
}
type Figures = Awaited<ReturnType<typeof drawnBars>>;
const tenth = (value: number) => Math.round(value * 10) / 10;

/** Pairs drawn against the data's order: a smaller width drawing as wide or wider. A tie in the data may tie. */
const outOfOrder = (figures: Figures) => figures.flatMap(({ bars }) => bars.flatMap((a) => bars
  .filter((b) => a.data < b.data && a.drawn >= b.drawn)
  .map((b) => `${a.name} (width ${a.data}) draws ${tenth(a.drawn)}px, not narrower than ${b.name} (width ${b.data}) at ${tenth(b.drawn)}px`)));

/** Groups of bars with the same width whose drawn widths differ by more than `gap`, compared to 0.1px. */
const unequal = (figures: Figures, gap: number) => figures.flatMap(({ bars }) => [...new Set(bars.map(({ data }) => data))].flatMap((data) => {
  const same = bars.filter((bar) => bar.data === data);
  const spread = tenth(tenth(Math.max(...same.map(({ drawn }) => drawn))) - tenth(Math.min(...same.map(({ drawn }) => drawn))));
  return spread > gap ? [`width ${data} draws ${spread}px apart: ${same.map(({ name, drawn }) => `${name} ${tenth(drawn)}`).join(', ')}`] : [];
}));

for (const study of withDiagrams) {
  for (const state of states) {
    test(`/${study.path} figures fit at ${label(state)}`, async ({ page }) => {
      await open(page, study.path, state);
      const plain = state.text === 100 && !state.spacing;
      // At the default text size nothing may even use the card padding; larger text may, up to the edge.
      if (plain) expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 'no sideways page scroll').toBe(0);
      expect(await page.evaluate(figureOverflow, plain), 'nothing crosses the card edge').toEqual([]);
      const figures = await page.evaluate(drawnBars);
      expect(outOfOrder(figures), 'bars draw in the order of their widths').toEqual([]);
      if (state.sameWidthGap !== null) expect(unequal(figures, state.sameWidthGap), 'bars with the same width draw the same').toEqual([]);
      for (const { content, rem, sideBySide, shapes, bars } of figures) {
        // The spec's two container widths: shapes side by side from 34rem, labels above thin bars below 12rem.
        if (shapes > 1) expect(sideBySide, `shapes side by side only from 34rem (content ${tenth(content)}px)`).toBe(content >= 34 * rem);
        expect(bars.every(({ thin }) => thin === content < 12 * rem), `labels above thin bars only below 12rem (content ${tenth(content)}px)`).toBe(true);
      }
    });
  }
}

test('the fit checks report a bar past the edge, an inverted order, unequal same-width bars and overflowing content', async ({ page }) => {
  const study = layerStackPages[0];
  expect(study, 'a page with a layer stack').toBeDefined();
  await open(page, study.path, { width: 320, text: 100, sameWidthGap: 0 });
  expect(await page.evaluate(figureOverflow, true)).toEqual([]);
  expect(unequal(await page.evaluate(drawnBars), 0)).toEqual([]);
  // One width 1 bar a little wider than the others: the order still holds, the equality does not.
  await page.addStyleTag({ content: 'figure[data-diagram] .dg-shape:first-child li[data-width="1"] { --dg-width: .45; }' });
  expect(outOfOrder(await page.evaluate(drawnBars))).toEqual([]);
  expect(unequal(await page.evaluate(drawnBars), 0).join('\n')).toMatch(/^width 1 draws [\d.]+px apart/);
  // Width 2 wider than width 3.
  await page.addStyleTag({ content: 'figure[data-diagram] li[data-width="2"] { --dg-width: .7; }' });
  expect(outOfOrder(await page.evaluate(drawnBars)).join('\n')).toMatch(/\(width 2\) draws [\d.]+px, not narrower than .* \(width 3\)/);
  // Labels squeezed into boxes too small for them.
  await page.addStyleTag({ content: 'figure[data-diagram] li { min-inline-size: 0; inline-size: 1.5rem; overflow: hidden; }' });
  expect((await page.evaluate(figureOverflow, true)).join('\n')).toMatch(/holds content \d+px wider than its box/);
});

test('with 200% text, a bar drawn past the card edge is reported', async ({ page }) => {
  const study = layerStackPages[0];
  expect(study, 'a page with a layer stack').toBeDefined();
  await open(page, study.path, { width: 320, text: 200, sameWidthGap: 0 });
  expect(await page.evaluate(figureOverflow, false)).toEqual([]);
  // Content in the padding alone is allowed; this plant widens the stacks until their bars pass the edge.
  await page.addStyleTag({ content: 'figure[data-diagram] .dg-layers { max-inline-size: none; inline-size: calc(100% + 4rem); margin-inline: 0; }' });
  expect((await page.evaluate(figureOverflow, false)).join('\n')).toMatch(/the card edge by [\d.]+px/);
});
