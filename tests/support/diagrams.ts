import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/**
 * Shows scrollbars: `test.use(withScrollbars)` at the top of every spec that checks how a figure fits.
 * Playwright's default browser hides them, so a 320px window lends all 320px to the page. A desktop
 * browser keeps 15px of it for the scrollbar (305px measured on 2026-11-28), and that gap hid a
 * honeycomb bar 9.8px past the card edge at 200% text. It is a browser option, which Playwright only
 * allows at the top of a file.
 */
export const withScrollbars = { channel: 'chromium', launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } };

export interface FitState {
  width: number;
  /** Text size as the browser's default font size, in percent of 16px. */
  text: 100 | 150 | 200;
  /** With the SC 1.4.12 text-spacing overrides. */
  spacing?: boolean;
}

/** The tightest wide layout: at 641px, 15px of it the scrollbar, a figure is 34rem wide inside its padding. */
export const tightestWide: FitState = { width: 641, text: 100 };

/** The states every figure has to fit in. */
export const fitStates: FitState[] = [
  { width: 1280, text: 100 },
  { width: 1024, text: 100 },
  { width: 768, text: 100 },
  tightestWide,
  { width: 360, text: 100 },
  { width: 320, text: 100 },
  { width: 360, text: 150 },
  { width: 320, text: 150 },
  { width: 360, text: 200 },
  { width: 320, text: 200 },
  { width: 1280, text: 200 },
  { width: 1280, text: 100, spacing: true },
  { width: 360, text: 100, spacing: true },
  { width: 320, text: 100, spacing: true },
  { width: 320, text: 200, spacing: true },
];
export const stateLabel = ({ width, text, spacing }: FitState) => `${width}px${text === 100 ? '' : ` with ${text}% text`}${spacing ? ' and the text-spacing overrides' : ''}`;

/** The SC 1.4.12 text-spacing overrides. */
const textSpacing = '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-block-end: 2em !important; }';

/** Opens a page in a state: the browser's default font size first, so the page loads with it. */
export async function openAt(page: Page, url: string, { width, text, spacing }: FitState) {
  await page.setViewportSize({ width, height: 900 });
  const cdp = await page.context().newCDPSession(page);
  // Whole pixels only: CDP refuses 19.5. The fixed size sets code text, which no diagram uses.
  await cdp.send('Page.setFontSizes', { fontSizes: { standard: 16 * text / 100, fixed: Math.round(13 * text / 100) } });
  const response = await page.goto(url);
  expect(response?.status(), url).toBe(200);
  await page.evaluate(() => document.fonts.ready);
  if (spacing) await page.addStyleTag({ content: textSpacing });
  // Without a scrollbar the page has 15px more room and these checks would pass on a layout nobody sees.
  expect(await page.evaluate(() => window.innerWidth - document.documentElement.clientWidth), 'the page shows its scrollbar').toBeGreaterThan(0);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize), 'the text size').toBe(`${16 * text / 100}px`);
}

/** An axe scan of one part of the page, with no violation of any impact allowed. */
export async function expectNoViolations(page: Page, part: string, state: string) {
  const { violations, passes } = await new AxeBuilder({ page }).include(part).analyze();
  expect(passes.length, 'axe ran no checks').toBeGreaterThan(0);
  expect(violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(({ target }) => target.join(' ')) })), state).toEqual([]);
}

/** How far the page scrolls sideways. Runs in the page, like the checks below, so it uses nothing from this module. */
export const sidewaysScroll = () => document.documentElement.scrollWidth - document.documentElement.clientWidth;

/**
 * Parts that cross their figure's outer edge: elements, the text inside them, and drawn bars, which
 * may be a bar's own box or its ::after. With `strict`, also a box whose content is wider than it is.
 * Without it, what sits inside a box that scrolls by itself is left to that box. A part that overflows
 * makes the boxes around it overflow as well, so only the innermost one is reported.
 */
export function figureOverflow(strict: boolean) {
  const name = (element: Element) => {
    const className = element.getAttribute('class');
    return `${element.tagName.toLowerCase()}${className ? `.${className.split(' ')[0]}` : ''} "${(element.textContent ?? '').trim().slice(0, 30)}"`;
  };
  return [...document.querySelectorAll('figure[data-diagram]')].flatMap((figure) => {
    const box = figure.getBoundingClientRect();
    const found: Array<{ element: Element; problem: string }> = [];
    const add = (element: Element, problem: string) => found.push({ element, problem: `${name(element)} ${problem}` });
    const past = (left: number, right: number) => Math.max(box.left - left, right - box.right);
    if (strict && figure.scrollWidth > figure.clientWidth) add(figure, `scrolls ${figure.scrollWidth - figure.clientWidth}px sideways`);
    for (const part of figure.querySelectorAll('*')) {
      if (part.closest('.visually-hidden')) continue;
      if (!strict && part.parentElement?.closest('.dg-scroll')) continue;
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
      if (over > 0.5) add(part, `passes the card edge by ${over.toFixed(1)}px`);
      // The corner axis name of a narrow matrix reaches over the first column on purpose (spec, narrow matrix).
      if (strict && !part.matches('.dg-axis-side') && part.clientWidth && part.scrollWidth > part.clientWidth + 1) add(part, `holds content ${part.scrollWidth - part.clientWidth}px wider than its box`);
      const after = getComputedStyle(part, '::after');
      if (after.content !== 'none' && after.content !== 'normal') {
        const width = parseFloat(after.width);
        const centre = rect.left + rect.width / 2;
        const barOver = past(centre - width / 2, centre + width / 2);
        if (barOver > 0.5) add(part, `draws its bar past the card edge by ${barOver.toFixed(1)}px`);
      }
    }
    return found.filter(({ element }) => !found.some((other) => other.element !== element && element.contains(other.element))).map(({ problem }) => problem);
  });
}

/** Table heads of a figure whose words overlap on screen. */
export function overlappingHeads() {
  const boxOf = (element: Element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect();
  };
  return [...document.querySelectorAll('figure[data-diagram] table')].flatMap((table) => {
    const heads = [...table.querySelectorAll('th')].filter((head) => head.getBoundingClientRect().width > 0)
      .map((head) => ({ text: head.textContent!.trim(), box: boxOf(head) }));
    return heads.flatMap((a, index) => heads.slice(index + 1).filter((b) =>
      Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left) > 0
      && Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top) > 0).map((b) => `"${a.text}" overlaps "${b.text}"`));
  });
}
