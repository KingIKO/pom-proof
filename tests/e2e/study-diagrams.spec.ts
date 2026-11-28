import { expect, test } from '@playwright/test';
import { drawingProblems, type FigureData } from '../support/diagram-drawing';
import { expectNoViolations, figureOverflow, fitStates, openAt, overlappingHeads, sidewaysScroll, stateLabel, tightestWide, withScrollbars, type FitState } from '../support/diagrams';
import { discoverStudyPages } from '../support/study';

// How Study concept diagrams of every kind fit their card and draw their data, in one page load per
// state, and that layer stack bars keep their widths (diagram spec, "Layer stack width limits" in
// docs/design/study-diagrams/spec.md). Placement and captions are checked in study.spec.ts. What a screen
// reader gets, and that each drawing check reports a planted fault, is in the spec of each kind.

test.use(withScrollbars);

const withDiagrams = discoverStudyPages().filter(({ frontmatter }) => Array.isArray(frontmatter.diagrams));
const layerStackPages = withDiagrams.filter(({ frontmatter }) => (frontmatter.diagrams as Array<{ type: string }>).some(({ type }) => type === 'layer-stack'));

/**
 * How far apart two bars with the same width may draw. The spec measured the fix drawing them equal
 * (spec, "Layer stack width limits", the 1280, 768, 360 and 320 rows), except for the limits it
 * accepts: 1.8px at 1024, 10px at 1280 with 200% text, and 3.3px at 1280 with the spacing overrides.
 * null: the spec records only the card edge for that state, so equal widths are not checked there.
 */
function sameWidthGap({ width, text, spacing }: FitState) {
  // With 200% text and the overrides, a shape name such as Honeycomb can be the longest word and widen its
  // own column, so its bars use a wider scale (9.8px at width 5 on 2026-11-28).
  if (spacing && text === 200) return null;
  if (spacing) return width === 1280 ? 3.3 : 0;
  if (width === 1280 && text === 200) return 10;
  // The spec has no row for the tightest wide layout (7px between UI and Integrated on 2026-11-28). Between
  // the rows it has, UI and Integrated also differ at 1008px (3.9px) and 992px (6.1px), and those widths
  // are not fit states.
  if (width === tightestWide.width) return null;
  return width === 1024 ? 1.8 : 0;
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

/** Kinds whose words may use the card padding with the text-spacing overrides: a bar grows to its longest word, and a matrix scrolls. */
const roomy = new Set(['layer-stack', 'matrix']);

for (const study of withDiagrams) {
  const listed = study.frontmatter.diagrams as FigureData[];
  for (const state of fitStates) {
    test(`/${study.path} figures fit and are drawn as their data says at ${stateLabel(state)}`, async ({ page }) => {
      await openAt(page, study.path, state);
      // At the default text size nothing may even use the card padding; larger text may, up to the edge.
      const strict = state.text === 100 && !(state.spacing && listed.some(({ type }) => roomy.has(type)));
      if (strict) expect(await page.evaluate(sidewaysScroll), 'no sideways page scroll').toBe(0);
      expect(await page.evaluate(figureOverflow, strict), 'nothing crosses the card edge').toEqual([]);
      expect(await page.evaluate(overlappingHeads)).toEqual([]);
      for (const figure of listed) expect(await drawingProblems(page, figure), figure.id).toEqual([]);
      // Axe where a figure changes most: on the narrowest phone, at both ends of the text sizes.
      if (state.width === 320 && state.text !== 150 && !state.spacing) await expectNoViolations(page, 'figure[data-diagram]', stateLabel(state));
      const figures = await page.evaluate(drawnBars);
      const gap = sameWidthGap(state);
      expect(outOfOrder(figures), 'bars draw in the order of their widths').toEqual([]);
      if (gap !== null) expect(unequal(figures, gap), 'bars with the same width draw the same').toEqual([]);
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
  await openAt(page, study.path, { width: 320, text: 100 });
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
  await openAt(page, study.path, { width: 320, text: 200 });
  expect(await page.evaluate(figureOverflow, false)).toEqual([]);
  // Content in the padding alone is allowed; this plant widens the stacks until their bars pass the edge.
  await page.addStyleTag({ content: 'figure[data-diagram] .dg-layers { max-inline-size: none; inline-size: calc(100% + 4rem); margin-inline: 0; }' });
  expect((await page.evaluate(figureOverflow, false)).join('\n')).toMatch(/the card edge by [\d.]+px/);
});
