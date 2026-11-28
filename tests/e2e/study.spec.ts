import { expect, test, type Page } from '@playwright/test';
import { showStudyInNav, siteSections } from '../../src/lib/site-nav';
import { discoverProblems } from '../support/problems';
import { discoverStudyModules, discoverStudyPages } from '../support/study';

// The Study section from the practice and study plan, section 3: landing, module page, left nav,
// the page order with the recap at the top, Mark as read, pager, Practice this and the header.

const prefix = '/pom-proof/';
const modules = discoverStudyModules().sort((a, b) => Number(a.data.order) - Number(b.data.order));
const pages = discoverStudyPages();
const pageObjects = 'study/framework-design/page-object-model/';
const parameterised = 'study/framework-design/parameterised-tests/';
/** Written pages in reading order: module order, then page order. */
const reading = modules.flatMap(({ id }) => pages.filter(({ folder }) => folder === id)
  .sort((a, b) => Number(a.frontmatter.order) - Number(b.frontmatter.order)));

const header = (page: Page) => page.getByRole('navigation', { name: 'Main' });

/** The header Study link: present and current while the switch is on, absent while it is off. */
async function expectHeaderStudy(page: Page, current: 'page' | 'location') {
  const link = header(page).getByRole('link', { name: 'Study' });
  if (showStudyInNav) await expect(link).toHaveAttribute('aria-current', current);
  else await expect(link).toHaveCount(0);
}

test('the landing lists four stages and every module, with Coming soon for modules without pages', async ({ page }) => {
  await page.goto('study/');
  await expect(page.getByRole('heading', { level: 1, name: 'Study' })).toBeVisible();
  await expect(page.locator('.study-stage > h2')).toHaveText(['A. Foundations', 'B. Automation craft', 'C. Tools', 'D. Running at scale and beyond']);
  const cards = page.locator('[data-study-module]');
  await expect(cards).toHaveCount(modules.length);
  for (const { id, data } of modules) {
    const card = page.locator(`[data-study-module="${id}"]`);
    const count = pages.filter(({ folder }) => folder === id).length;
    await expect(card.getByRole('heading', { name: String(data.title) })).toBeVisible();
    if (count) {
      await expect(card.getByRole('link', { name: String(data.title) })).toHaveAttribute('href', `${prefix}study/${id}/`);
      await expect(card).toContainText(`${count} page${count === 1 ? '' : 's'}`);
      await expect(card).not.toContainText('Coming soon');
    } else {
      await expect(card.getByRole('link')).toHaveCount(0);
      await expect(card).toContainText('Coming soon');
    }
  }
  await expectHeaderStudy(page, 'page');
  await page.getByRole('link', { name: 'Start here' }).click();
  await expect(page).toHaveURL(`${prefix}${reading[0].path}`);
});

test('the module page lists its pages in order and the left nav opens only the current module', async ({ page }) => {
  await page.goto('study/framework-design/');
  await expect(page.locator('[data-study-pages] h2')).toHaveText(reading.filter(({ folder }) => folder === 'framework-design')
    .map(({ frontmatter }) => String(frontmatter.title)));
  // One list carries the name "Pages in Framework design": the one in the module nav.
  await expect(page.getByRole('list', { name: /Framework design/ })).toHaveCount(1);
  const nav = page.getByRole('navigation', { name: 'Study modules' });
  await expect(nav.locator('.study-nav-pages')).toHaveCount(1);
  await expect(nav.getByRole('link', { name: 'Framework design' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('complementary')).toHaveCount(0);

  await page.goto(pageObjects);
  await expect(nav.locator('.study-nav-pages')).toHaveCount(1);
  await expect(nav.getByRole('list', { name: 'Pages in Framework design' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Page Object Model' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'Framework design' })).toHaveAttribute('aria-current', 'true');
  await expectHeaderStudy(page, 'location');
});

test('a reading page opens with outcomes and the recap, and ends with sources, practice, the read mark and the pager', async ({ page }) => {
  await page.goto(parameterised);
  await expect(page.locator('.study-article h2')).toHaveText([
    'Read first', 'After this page, you can', 'Use it when', 'Avoid it when',
    'What it is', 'How it works', 'Why it helps', 'When not to use it',
    'Example', 'What changed', 'Sources', 'Practice this',
  ]);
  await expect(page.locator('.study-intro .study-recap')).toContainText('Boundary and partition tables');
  // Every region after the body, in order, with Mark as read and the pager last.
  const order = await page.evaluate(() => [...document.querySelectorAll('.study-article > *, .study-pager')]
    .map((element) => element.querySelector('h2')?.textContent
      ?? (element.matches('[data-study-read-control]') ? 'read mark' : element.matches('.study-pager') ? 'pager' : element.className)));
  expect(order.slice(-4)).toEqual(['Sources', 'Practice this', 'read mark', 'pager']);
  // Both prerequisites are written, so Read first links to them.
  const readFirst = page.locator('.study-read-first');
  await expect(readFirst.getByRole('link')).toHaveCount(2);
  await expect(readFirst.getByRole('link').first()).toHaveAttribute('href', /\/study\/test-design\/equivalence-and-boundaries\/$/);
});

test('the summary, code and boxes share one right edge, and a long code line scrolls inside its box', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(pageObjects);
  await page.getByRole('group', { name: 'Example language' }).first().getByRole('button', { name: 'Java' }).click();
  const edges = await page.evaluate(() => {
    const right = (selector: string) => [...document.querySelectorAll(selector)]
      .filter((element) => (element as HTMLElement).offsetParent)
      .map((element) => Math.round(element.getBoundingClientRect().right));
    return {
      body: right('.study-body > p'),
      summary: right('.study-summary'),
      intro: right('.study-intro'),
      code: right('.study-examples pre'),
      positions: right('.study-positions'),
    };
  });
  const [edge] = edges.body;
  for (const [name, values] of Object.entries(edges)) {
    for (const value of values) expect(value, `${name} right edge`).toBeLessThanOrEqual(edge);
  }
  for (const name of ['summary', 'intro', 'code', 'positions'] as const) expect(Math.max(...edges[name]), `${name} reaches the edge`).toBe(edge);
  // On a phone the long Java line scrolls inside its box and the page itself does not.
  await page.setViewportSize({ width: 360, height: 760 });
  const java = page.locator('.study-examples pre').filter({ hasText: 'visibilityOfElementLocated' });
  expect(await java.evaluate((pre) => pre.scrollWidth > pre.clientWidth), 'the long Java line scrolls').toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth), 'no sideways page scroll').toBe(360);
});

test('Mark as read survives a reload, shows on the module and landing, and Mark as unread clears it', async ({ page }) => {
  await page.goto(pageObjects);
  await expect(page.getByRole('button', { name: 'Mark as unread' })).toBeHidden();
  await page.getByRole('button', { name: 'Mark as read' }).click();
  await expect(page.getByRole('button', { name: 'Mark as unread' })).toBeFocused();
  await expect(page.locator('[data-study-day]')).toHaveText(/^Read on \d{1,2} [A-Z][a-z]{2}$/);
  await expect(page.getByRole('button', { name: 'Mark as read' })).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Study modules' }).getByRole('link', { name: /Page Object Model/ })).toContainText('Read');

  await page.reload();
  await expect(page.locator('[data-study-day]')).toHaveText(/^Read on /);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('pom-proof:study') ?? 'null'));
  expect(stored).toEqual({ version: 1, read: { 'framework-design/page-object-model': expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) } });

  await page.goto('study/framework-design/');
  await expect(page.locator('[data-study-pages] [data-study-status="framework-design/page-object-model"]')).toHaveText('Read');
  await page.goto('study/');
  const card = page.locator('[data-study-module="framework-design"]');
  const written = pages.filter(({ folder }) => folder === 'framework-design').length;
  await expect(card).toContainText(`1 of ${written} read`);
  const next = reading.find(({ id }) => id !== 'framework-design/page-object-model');
  if (next) {
    await expect(page.getByRole('link', { name: 'Continue' })).toHaveAttribute('href', `${prefix}${next.path}`);
  }

  await page.goto(pageObjects);
  await page.getByRole('button', { name: 'Mark as unread' }).click();
  await expect(page.getByRole('button', { name: 'Mark as read' })).toBeFocused();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Mark as read' })).toBeVisible();
  await page.goto('study/');
  await expect(card.locator('[data-study-count]')).toBeHidden();
  await expect(page.getByRole('link', { name: 'Start here' })).toBeVisible();
});

test('focus stays on the read control when another tab marks the page unread', async ({ page, context }) => {
  await page.goto(pageObjects);
  await page.getByRole('button', { name: 'Mark as read' }).click();
  await expect(page.getByRole('button', { name: 'Mark as unread' })).toBeFocused();
  const other = await context.newPage();
  await other.goto(pageObjects);
  await other.getByRole('button', { name: 'Mark as unread' }).click();
  await expect(page.getByRole('button', { name: 'Mark as read' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mark as read' })).toBeFocused();
  await other.close();
});

test('blocked storage replaces Mark as read with a note', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await page.goto(pageObjects);
  await expect(page.locator('[data-study-unavailable]')).toHaveText('This browser is not saving data for this site, so pages cannot be marked as read.');
  await expect(page.getByRole('button', { name: 'Mark as read' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Mark as unread' })).toBeHidden();
});

test('read marks saved by a newer version are left alone', async ({ page }) => {
  const newer = JSON.stringify({ version: 2, read: { 'framework-design/page-object-model': '2027-01-04' } });
  await page.goto('study/');
  await page.evaluate((value) => localStorage.setItem('pom-proof:study', value), newer);
  await page.goto(pageObjects);
  await expect(page.locator('[data-study-unavailable]')).toHaveText('A newer version of this site saved your read marks. Reload the page to change them.');
  await expect(page.getByRole('button', { name: 'Mark as read' })).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('pom-proof:study'))).toBe(newer);
});

test('the pager walks the pages in reading order and links the module overview', async ({ page }) => {
  expect(reading.length, 'two pilot pages').toBeGreaterThanOrEqual(2);
  await page.goto(reading[0].path);
  const pager = page.getByRole('navigation', { name: 'Study pages' });
  await expect(pager.locator('a[rel="prev"]')).toHaveCount(0);
  await pager.locator('a[rel="next"]').click();
  await expect(page).toHaveURL(`${prefix}${reading[1].path}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(String(reading[1].frontmatter.title));
  await pager.locator('a[rel="prev"]').click();
  await expect(page).toHaveURL(`${prefix}${reading[0].path}`);
  await pager.getByRole('link', { name: 'Module overview' }).click();
  await expect(page).toHaveURL(`${prefix}study/${reading[0].folder}/`);
  await page.goto(reading.at(-1)!.path);
  await expect(pager.locator('a[rel="next"]')).toHaveCount(0);
});

test('Practice this opens the practice list filtered to the page topics', async ({ page }) => {
  const study = pages.find(({ path }) => path === parameterised)!;
  const topics = study.frontmatter.practiceTopics as string[];
  const expected = discoverProblems().filter(({ data }) => topics.includes(data.topic)).length;
  await page.goto(parameterised);
  const link = page.getByRole('link', { name: `Practice ${expected} problem${expected === 1 ? '' : 's'}` });
  await expect(link).toHaveAttribute('href', `${prefix}?topic=${topics.join(',')}`);
  await link.click();
  await expect(page.getByRole('table', { name: 'Practice problems' }).locator('tbody tr')).toHaveCount(expected);
  for (const topic of topics) await expect(page.locator(`input[name="topic"][value="${topic}"]`)).toBeChecked();
});

test('the language switcher changes the Study example', async ({ page }) => {
  await page.goto(parameterised);
  const figure = page.locator('[data-code-example]');
  const languages = figure.getByRole('group', { name: 'Example language' });
  await expect(languages.getByRole('button', { name: 'TypeScript' })).toHaveAttribute('aria-pressed', 'true');
  await expect(figure.getByRole('region', { name: 'Code example: Playwright Test' })).toBeVisible();
  await languages.getByRole('button', { name: 'Python' }).click();
  await expect(languages.getByRole('button', { name: 'Python' })).toHaveAttribute('aria-pressed', 'true');
  await expect(figure.getByRole('region', { name: 'Code example: pytest' })).toContainText('@pytest.mark.parametrize');
});

test('the page object page gives both sides of the assertion dispute, with their sources', async ({ page }) => {
  await page.goto(pageObjects);
  const dispute = page.locator('[data-study-disputes]');
  await expect(dispute.getByRole('heading', { name: 'Should a page object contain assertions?' })).toBeVisible();
  const positions = dispute.locator('.study-position');
  await expect(positions).toHaveCount(2);
  await expect(positions.nth(0).getByRole('link')).toHaveText(['Selenium: Page object models', 'Martin Fowler: PageObject']);
  await expect(positions.nth(1).getByRole('link')).toHaveText(['Martin Fowler: PageObject', 'Playwright: Page object models']);
  await expect(positions.nth(1).getByRole('link').nth(1)).toHaveAttribute('href', 'https://playwright.dev/docs/pom');
  // No practice problem is about page objects, so only the question links remain.
  await expect(page.locator('[data-study-practice]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /^Framework design: \d+ questions$/ })).toBeVisible();
});

// Concept diagrams (diagram plan, section 4): one figure per frontmatter entry, each after body
// content other than a heading, captioned from the frontmatter, with no marker left in the page. At
// 1280, 360 and 320px the page never scrolls sideways and no part of a figure spills out of the
// figure or its box. With 200% text on a phone, a part may use the card padding but not cross the
// card edge, and no bar draws wider than its shape's widest.

interface DiagramData {
  id: string;
  type: string;
  title: string;
  note?: string;
  shapes?: Array<{ name: string; layers: Array<{ label: string; widest?: boolean }> }>;
}
const withDiagrams = pages.filter(({ frontmatter }) => Array.isArray(frontmatter.diagrams));
const diagramsOf = (study: (typeof pages)[number]) => study.frontmatter.diagrams as DiagramData[];

/**
 * Parts that spill out of their figure, and boxes whose content is wider than they are. With
 * `edgeOnly`, only a part that crosses the figure's outer edge counts, so content may use the padding.
 */
function figureOverflow(edgeOnly: boolean) {
  const name = (element: Element) => {
    const className = element.getAttribute('class');
    return `${element.tagName.toLowerCase()}${className ? `.${className.split(' ')[0]}` : ''} "${(element.textContent ?? '').trim().slice(0, 30)}"`;
  };
  return [...document.querySelectorAll('figure[data-diagram]')].flatMap((figure) => {
    const box = figure.getBoundingClientRect();
    const found: string[] = [];
    if (!edgeOnly && figure.scrollWidth > figure.clientWidth) found.push(`${name(figure)} scrolls ${figure.scrollWidth - figure.clientWidth}px sideways`);
    for (const part of figure.querySelectorAll('*')) {
      if (part.closest('.visually-hidden')) continue;
      const rect = part.getBoundingClientRect();
      if (!rect.width && !rect.height) continue;
      if (rect.left < box.left - 0.5 || rect.right > box.right + 0.5) found.push(`${name(part)} spills out of its figure`);
      if (!edgeOnly && part.clientWidth && part.scrollWidth > part.clientWidth + 1) found.push(`${name(part)} holds content ${part.scrollWidth - part.clientWidth}px wider than its box`);
    }
    return found;
  });
}

/** Each layer stack's shapes: where they sit, and the drawn width of the widest bar and the others. */
function layerWidths() {
  return [...document.querySelectorAll('figure[data-diagram="layer-stack"]')].map((figure) => [...figure.querySelectorAll('.dg-shape')].map((shape) => ({
    name: (shape.querySelector('.dg-shape-name')?.textContent ?? '').trim(),
    top: Math.round(shape.getBoundingClientRect().top),
    widest: Math.round(shape.querySelector('li[data-widest]')!.getBoundingClientRect().width),
    others: [...shape.querySelectorAll('li:not([data-widest])')].map((bar) => Math.round(bar.getBoundingClientRect().width)),
  })));
}
type Shapes = ReturnType<typeof layerWidths>;

/** Shapes whose widest layer does not draw widest. With `allowTie`, a bar as wide as the widest passes. */
const notWidest = (figures: Shapes, allowTie: boolean) => figures.flat()
  .filter(({ widest, others }) => others.some((bar) => (allowTie ? bar > widest : bar >= widest)))
  .map(({ name, widest, others }) => `${name}: widest ${widest}px, others ${others.join(', ')}px`);

/** Sets the root text size to 200%, as a reader's text zoom does. */
const doubleText = () => { document.documentElement.style.fontSize = '200%'; };

test('at least one Study page has a concept diagram', () => {
  expect(withDiagrams.length).toBeGreaterThan(0);
});

for (const study of withDiagrams) {
  test(`/${study.path} shows each diagram once, after a paragraph, captioned from its frontmatter`, async ({ page }) => {
    await page.goto(study.path);
    const body = page.locator('.study-body');
    await expect(body.locator('figure[data-diagram]')).toHaveCount(diagramsOf(study).length);
    await expect(page.locator('.language-diagram')).toHaveCount(0);
    await expect(page.getByText(/```diagram/)).toHaveCount(0);
    for (const { id, type, title, note, shapes } of diagramsOf(study)) {
      const figure = page.locator(`.study-body > figure[data-diagram="${type}"]:has(> figcaption#dg-${id})`);
      await expect(figure, `figure ${id} is a direct part of the body`).toHaveCount(1);
      // The same rule as study.test.ts: any body content may come first, except a heading.
      const before = await figure.evaluate((element) => element.previousElementSibling?.tagName ?? '');
      expect(before, `figure ${id} follows body content`).not.toBe('');
      expect(before, `figure ${id} does not sit directly after a heading`).not.toMatch(/^H[1-6]$/);
      await expect(figure.locator('.dg-title')).toHaveText(title);
      if (note) await expect(figure.locator('.dg-note')).toHaveText(note);
      await expect(page.getByRole('figure', { name: new RegExp(`^${title}`) })).toHaveCount(1);
      // A layer stack is one named list per shape, top to bottom, with the widest layer said in words.
      for (const { name, layers } of shapes ?? []) {
        await expect(figure.getByRole('list', { name, exact: true }).getByRole('listitem'))
          .toHaveText(layers.map(({ label, widest }) => `${label}${widest ? ', widest' : ''}`));
      }
    }
  });

  for (const width of [1280, 360, 320]) {
    test(`/${study.path} figures fit at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(study.path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), 'no sideways page scroll').toBe(width);
      expect(await page.evaluate(figureOverflow, false)).toEqual([]);
      // Each shape's widest layer still draws widest, and the shapes sit side by side only on a wide figure.
      const figures = await page.evaluate(layerWidths);
      expect(notWidest(figures, false), 'the widest layer draws widest').toEqual([]);
      for (const shapes of figures.filter((list) => list.length > 1)) {
        const sideBySide = new Set(shapes.map(({ top }) => top)).size === 1;
        expect(sideBySide, width >= 1280 ? 'shapes side by side' : 'shapes stacked').toBe(width >= 1280);
      }
    });
  }

  for (const width of [360, 320]) {
    test(`/${study.path} figures stay inside their card at ${width}px with 200% text`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(study.path);
      await page.evaluate(doubleText);
      expect(await page.evaluate(figureOverflow, true), 'no part crosses the card edge').toEqual([]);
      expect(notWidest(await page.evaluate(layerWidths), true), 'no bar draws wider than its widest').toEqual([]);
    });
  }
}

test('a diagram part wider than its figure is reported', async ({ page }) => {
  const study = withDiagrams[0];
  expect(study, 'a page with a diagram').toBeDefined();
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(study.path);
  expect(await page.evaluate(figureOverflow, false)).toEqual([]);
  await page.addStyleTag({ content: 'figure[data-diagram] li { min-inline-size: 0; inline-size: 1.5rem; overflow: hidden; }' });
  expect((await page.evaluate(figureOverflow, false)).join('\n')).toMatch(/holds content \d+px wider than its box/);
  await page.addStyleTag({ content: 'figure[data-diagram] .dg-layers { max-inline-size: none; inline-size: 40rem; }' });
  expect((await page.evaluate(figureOverflow, false)).join('\n')).toMatch(/spills out of its figure/);
});

test('with 200% text, a part past the card edge and a bar wider than the widest are reported', async ({ page }) => {
  const study = withDiagrams.find((entry) => diagramsOf(entry).some(({ type }) => type === 'layer-stack'));
  expect(study, 'a page with a layer stack').toBeDefined();
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(study!.path);
  await page.evaluate(doubleText);
  expect(await page.evaluate(figureOverflow, true)).toEqual([]);
  expect(notWidest(await page.evaluate(layerWidths), true)).toEqual([]);
  // Other bars wider than the widest, still inside the card: only the width check reports it.
  await page.addStyleTag({ content: 'figure[data-diagram] li { inline-size: 100%; } figure[data-diagram] li[data-widest] { inline-size: 90%; }' });
  expect(await page.evaluate(figureOverflow, true)).toEqual([]);
  expect(notWidest(await page.evaluate(layerWidths), true).join('\n')).toMatch(/widest \d+px, others/);
  // Content in the padding alone is allowed; this plant widens the bars until they pass the edge.
  await page.addStyleTag({ content: 'figure[data-diagram] .dg-layers { max-inline-size: none; inline-size: calc(100% + 4rem); margin-inline: 0; }' });
  expect((await page.evaluate(figureOverflow, true)).join('\n')).toMatch(/spills out of its figure/);
});

test.describe('at 360px', () => {
  test.use({ viewport: { width: 360, height: 760 } });

  for (const path of ['study/', pageObjects]) {
    test(`/${path} shows every header link without overflow`, async ({ page }) => {
      await page.goto(path);
      const links = header(page).getByRole('link');
      await expect(links).toHaveText(siteSections.map(({ label }) => label));
      for (const link of await links.all()) {
        await expect(link).toBeInViewport({ ratio: 1 });
        const box = (await link.boundingBox())!;
        expect(box.height, 'a 44px tall target').toBeGreaterThanOrEqual(44);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth), 'no sideways scroll').toBe(360);
      expect(await header(page).evaluate((nav) => nav.scrollWidth - nav.clientWidth), 'the nav does not scroll').toBe(0);
    });
  }

  test('a focused header link shows its whole focus ring inside the nav', async ({ page }) => {
    await page.goto('study/');
    const link = header(page).getByRole('link').first();
    for (let step = 0; step < 5 && !await link.evaluate((element) => element === document.activeElement); step += 1) {
      await page.keyboard.press('Tab');
    }
    await expect(link).toBeFocused();
    const ring = await link.evaluate((element) => {
      const style = getComputedStyle(element);
      const nav = element.closest('nav')!.getBoundingClientRect();
      const box = element.getBoundingClientRect();
      const reach = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset);
      return { style: style.outlineStyle, width: parseFloat(style.outlineWidth), top: box.top - reach >= nav.top, bottom: box.bottom + reach <= nav.bottom };
    });
    expect(ring.style, 'a visible focus ring').not.toBe('none');
    expect(ring.width).toBeGreaterThan(0);
    expect({ top: ring.top, bottom: ring.bottom }, 'the ring fits inside the scrolling nav').toEqual({ top: true, bottom: true });
  });

  test('the module list is one closed disclosure above the page', async ({ page }) => {
    await page.goto(pageObjects);
    const modules = page.locator('details[data-study-nav]');
    await expect(modules).not.toHaveAttribute('open');
    await expect(modules.locator('summary')).toContainText('Modules: Framework design');
    await modules.locator('summary').click();
    await expect(page.getByRole('navigation', { name: 'Study modules' }).getByRole('link', { name: 'Parameterised and data-driven tests' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
  });

  test('the module list does not shift the page while it loads on a slow phone', async ({ page }) => {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
    await page.addInitScript(() => {
      const shifts = { total: 0 };
      (window as unknown as { studyShifts: typeof shifts }).studyShifts = shifts;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
          if (!entry.hadRecentInput) shifts.total += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(pageObjects, { waitUntil: 'load' });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const total = await page.evaluate(() => (window as unknown as { studyShifts: { total: number } }).studyShifts.total);
    // 0.1 is the "good" limit for cumulative layout shift in Core Web Vitals.
    expect(total, 'cumulative layout shift').toBeLessThan(0.1);
  });
});

test.describe('at 320px', () => {
  test.use({ viewport: { width: 320, height: 760 } });

  test('a lone Next or Previous link takes the whole pager row', async ({ page }) => {
    for (const [path, rel] of [[reading[0].path, 'next'], [reading.at(-1)!.path, 'prev']] as const) {
      await page.goto(path);
      const pager = page.getByRole('navigation', { name: 'Study pages' });
      const row = (await pager.boundingBox())!;
      const lone = (await pager.locator(`a[rel="${rel}"]`).locator('..').boundingBox())!;
      expect(Math.round(lone.width), `${rel} on /${path}`).toBe(Math.round(row.width));
    }
  });
});
