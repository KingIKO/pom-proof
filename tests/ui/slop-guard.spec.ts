import { readdirSync } from 'node:fs';
import { join, sep } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { discoverProblems, onePerKind, root } from '../support/problems';
import { openWorkspace, resultPanel, submitStructured } from '../support/workspace';

type Rule =
  | 'gradient' | 'box-shadow' | 'text-shadow' | 'border-radius' | 'backdrop-filter' | 'blur'
  | 'emoji' | 'em dash' | 'decorative image';
type Violation = { rule: Rule; where: string; value: string };

/**
 * Every route under src/pages, with the sample URLs that stand for it. A new dynamic route
 * without samples fails the run, so a new page type cannot skip the guard.
 */
function pageSamples() {
  const pages = join(root, 'src', 'pages');
  const editorials = readdirSync(join(root, 'content', 'editorials')).filter((file) => file.endsWith('.md')).sort();
  const tracks = readdirSync(join(root, 'content', 'tracks')).filter((file) => /\.ya?ml$/.test(file)).sort();
  const routes = readdirSync(pages, { recursive: true, encoding: 'utf8' })
    .filter((file) => /\.(astro|md|mdx|html)$/.test(file))
    .map((file) => file.split(sep).join('/').replace(/\.\w+$/, '').replace(/(^|\/)index$/, ''));
  return routes.map((route) => {
    if (!route.includes('[')) {
      if (route === '404') return { route, urls: ['this-page-does-not-exist/'], status: 404 };
      return { route, urls: [route ? `${route}/` : ''], status: 200 };
    }
    if (route === 'practice/[kind]/[id]') return { route, urls: onePerKind().map(({ path }) => path), status: 200 };
    if (route === 'editorials/[id]') return { route, urls: editorials.slice(0, 1).map((file) => `editorials/${file.slice(0, -3)}/`), status: 200 };
    // The question 2E built the page against; it has every answer section, sources included.
    if (route === 'questions/[topic]/[id]') return { route, urls: ['questions/playwright/independent-checkout-contexts/'], status: 200 };
    if (route === 'tracks/[role]') return { route, urls: tracks.slice(0, 1).map((file) => `tracks/${file.replace(/\.ya?ml$/, '')}/`), status: 200 };
    return { route, urls: [], status: 200 };
  });
}

/** Scans every element and pseudo-element at rest, plus visible text and UI attributes. */
function scan(page: Page): Promise<Violation[]> {
  return page.evaluate(() => {
    const found: Violation[] = [];
    const describe = (element: Element, pseudo = '') => {
      const id = element.id ? `#${element.id}` : element.getAttribute('type') ? `[type=${element.getAttribute('type')}]` : '';
      const classes = typeof element.className === 'string' && element.className.trim()
        ? `.${element.className.trim().split(/\s+/).slice(0, 3).join('.')}`
        : '';
      const text = (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
      return `${element.tagName.toLowerCase()}${id}${classes}${pseudo}${text ? ` "${text}"` : ''}`;
    };
    const add = (rule: Rule, where: string, value: string) => found.push({ rule, where, value });
    const tooRound = (value: string) =>
      value.split(/\s+/).some((part) => (part.endsWith('%') ? parseFloat(part) > 0 : parseFloat(part) > 4));
    const corners = ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius'];
    const emoji = /[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Regional_Indicator}\u{FE0F}\u{20E3}]/u;
    const emDash = '—';

    for (const element of document.querySelectorAll('*')) {
      const pseudos = element.tagName === 'DIALOG' ? ['', '::before', '::after', '::backdrop'] : ['', '::before', '::after'];
      for (const pseudo of pseudos) {
        const style = getComputedStyle(element, pseudo || null);
        if ((pseudo === '::before' || pseudo === '::after') && (style.content === 'none' || style.content === 'normal')) continue;
        const where = describe(element, pseudo);
        if (style.backgroundImage.includes('gradient')) add('gradient', where, style.backgroundImage);
        else if (style.backgroundImage !== 'none') add('decorative image', where, style.backgroundImage);
        if (style.borderImageSource.includes('gradient')) add('gradient', where, style.borderImageSource);
        else if (style.borderImageSource !== 'none') add('decorative image', where, style.borderImageSource);
        if (style.listStyleImage !== 'none') add('decorative image', where, style.listStyleImage);
        if (style.maskImage && style.maskImage !== 'none') add('decorative image', where, style.maskImage);
        if (pseudo && /url\(|gradient|image-set/.test(style.content)) add('decorative image', where, style.content);
        if (style.boxShadow !== 'none') add('box-shadow', where, style.boxShadow);
        if (style.textShadow !== 'none') add('text-shadow', where, style.textShadow);
        if (style.backdropFilter !== 'none') add('backdrop-filter', where, style.backdropFilter);
        if (/blur|drop-shadow/.test(style.filter)) add('blur', where, style.filter);
        // A natively drawn radio is round by the browser's own stylesheet, not by site styling.
        if (!pseudo && element.matches('input[type="radio"]') && style.appearance !== 'none') continue;
        for (const corner of corners) {
          const value = style.getPropertyValue(corner);
          if (tooRound(value)) add('border-radius', where, `${corner}: ${value}`);
        }
      }
    }

    for (const element of document.querySelectorAll('svg, img, picture, input[type="image"], object, embed')) {
      add('decorative image', describe(element), element.tagName.toLowerCase());
    }

    const checkText = (text: string, where: string) => {
      const match = text.match(emoji);
      if (match) add('emoji', where, `U+${match[0].codePointAt(0)!.toString(16).toUpperCase()} in "${text.trim().slice(0, 60)}"`);
      if (text.includes(emDash)) add('em dash', where, text.trim().slice(0, 80));
    };
    for (const details of document.querySelectorAll('details')) details.open = true;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, template, noscript')) continue;
      if (!parent.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      checkText((node as Text).data, describe(parent));
    }
    for (const element of document.querySelectorAll('[placeholder], [aria-label], [title], [alt], input[value]')) {
      for (const name of ['placeholder', 'aria-label', 'title', 'alt', 'value']) {
        const value = element.getAttribute(name);
        if (value) checkText(value, `${describe(element)} [${name}]`);
      }
    }
    checkText(document.title, 'document title');
    return found;
  });
}

/**
 * The focused element, followed into a same-origin frame (the locator fixture): its label, whether
 * it or a wrapper shows a ring, and banned styles on it and its ancestors. Null when nothing has focus.
 */
function readFocusState(): { label: string; key: string; ring: boolean; problems: Violation[] } | null {
  let active = document.activeElement;
  while (active?.tagName === 'IFRAME' && (active as HTMLIFrameElement).contentDocument?.activeElement) {
    const inner = (active as HTMLIFrameElement).contentDocument!.activeElement!;
    if (inner === inner.ownerDocument.body) break;
    active = inner;
  }
  if (!active || active === document.body) return null;
  const label = (element: Element) =>
    `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''} "${(element.textContent ?? '').trim().slice(0, 30)}"`;
  const shadows = (value: string) => value.split(/,(?![^(]*\))/);
  const isRing = (value: string) => shadows(value).every((shadow) => {
    const [x = 0, y = 0, blur = 0, spread = 0] = shadow
      .replace(/[a-z-]+\([^)]*\)/gi, '')
      .replace(/inset|#[0-9a-f]+|[a-z]+(?=\s|$)/gi, '')
      .trim()
      .split(/\s+/)
      .map(parseFloat);
    return x === 0 && y === 0 && blur === 0 && spread > 0;
  });
  const up = (element: Element) => element.parentElement ?? (element.ownerDocument.defaultView!.frameElement as Element | null);
  let ring = false;
  for (let element: Element | null = active; element && element !== document.body && !ring; element = up(element)) {
    const style = element.ownerDocument.defaultView!.getComputedStyle(element);
    ring = (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== 'none';
  }
  const problems: Violation[] = [];
  for (let element: Element | null = active; element; element = up(element)) {
    const style = element.ownerDocument.defaultView!.getComputedStyle(element);
    const where = `${label(element)} while ${label(active)} has focus`;
    // A natively drawn radio is round by the browser's own stylesheet, not by site styling.
    const nativeRadio = element.matches('input[type="radio"]') && style.appearance !== 'none';
    if (style.boxShadow !== 'none' && !isRing(style.boxShadow)) problems.push({ rule: 'box-shadow', where, value: style.boxShadow });
    if (style.backgroundImage.includes('gradient')) problems.push({ rule: 'gradient', where, value: style.backgroundImage });
    if (style.backdropFilter !== 'none') problems.push({ rule: 'backdrop-filter', where, value: style.backdropFilter });
    for (const corner of ['border-top-left-radius', 'border-bottom-right-radius']) {
      const value = style.getPropertyValue(corner);
      if (!nativeRadio && value.split(/\s+/).some((part) => (part.endsWith('%') ? parseFloat(part) > 0 : parseFloat(part) > 4))) {
        problems.push({ rule: 'border-radius', where, value: `${corner}: ${value}` });
      }
    }
  }
  return { label: `${active.tagName.toLowerCase()} "${(active.textContent ?? '').trim().slice(0, 30)}"`, key: label(active) + (active.getAttribute('href') ?? ''), ring, problems };
}

/**
 * Tabs through every focusable control. The focused element and its ancestors may carry a
 * focus ring (a zero-offset, zero-blur box-shadow spread), and nothing else from the banned list.
 */
async function scanFocusStates(page: Page): Promise<Violation[]> {
  const found: Violation[] = [];
  await page.locator('body').focus();
  const focusable = 'a[href], button, input, select, textarea, summary, iframe, [tabindex], [contenteditable="true"]';
  const limit = await page.evaluate((selector) => [document, ...Array.from(document.querySelectorAll('iframe'), (frame) => frame.contentDocument)]
    .reduce((total, doc) => total + (doc?.querySelectorAll(selector).length ?? 0), 0), focusable);
  expect(limit, 'page has no focusable controls').toBeGreaterThan(0);
  let first: string | null = null;
  for (let step = 0; step <= limit; step += 1) {
    await page.keyboard.press('Tab');
    // One read per step; when the ring is not there yet, poll until it is (CodeMirror adds
    // .cm-focused a moment after focus) and keep the state read once it shows.
    let state = await page.evaluate(readFocusState);
    if (state === null) break;
    if (!state.ring) {
      const label = state.label;
      await expect.poll(async () => (state = await page.evaluate(readFocusState))?.ring ?? false,
        { message: `${label} has focus without a visible focus ring` }).toBe(true);
    }
    if (state === null || state.key === first) break;
    first ??= state.key;
    found.push(...state.problems);
  }
  return found;
}

async function settle(page: Page, url: string, status: number) {
  const response = await page.goto(url);
  expect(response?.status(), `${url} status`).toBe(status);
  await expect(page.locator('main')).toBeVisible();
  // Astro removes the ssr attribute once an island hydrates.
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
}

const samples = pageSamples();

test('every page route has a sample for the guard', () => {
  expect(samples.length, 'no routes found under src/pages').toBeGreaterThan(0);
  expect(samples.filter(({ urls }) => urls.length === 0).map(({ route }) => route), 'routes with no sample URL').toEqual([]);
});

for (const scheme of ['light', 'dark'] as const) {
  for (const { route, urls, status } of samples) {
    for (const url of urls) {
      test(`${scheme}: /${url} (${route || 'index'}) has no slop`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        await settle(page, url, status);
        expect(await scan(page), 'at rest').toEqual([]);
        expect(await scanFocusStates(page), 'focus states').toEqual([]);
      });
    }
  }
}

const structured = discoverProblems().filter((problem): problem is Parameters<typeof submitStructured>[1] =>
  problem.kind === 'scenario' || problem.kind === 'diagnosis' || problem.kind === 'bug-report');

test('structured problems exist for the result-state scans', () => {
  expect(new Set(structured.map(({ kind }) => kind))).toEqual(new Set(['scenario', 'diagnosis', 'bug-report']));
});

for (const scheme of ['light', 'dark'] as const) {
  for (const kind of ['scenario', 'diagnosis', 'bug-report'] as const) {
    const problem = structured.find((candidate) => candidate.kind === kind);
    test(`${scheme}: ${kind} result states (fail, pass) have no slop`, async ({ page }) => {
      expect(problem, `a ${kind} problem`).toBeDefined();
      await page.emulateMedia({ colorScheme: scheme });
      await openWorkspace(page, problem!);
      await submitStructured(page, problem!, 'decoy');
      expect(await scan(page), 'fail').toEqual([]);
      await page.getByRole('region', { name: 'Workspace' }).getByRole('button', { name: 'Try again', exact: true }).click();
      await submitStructured(page, problem!, 'reference');
      expect(await scan(page), 'pass').toEqual([]);
    });
  }

  test(`${scheme}: the not-graded result state has no slop`, async ({ page }) => {
    // An empty scenario submit leaves its single-choice item unanswered, which is an invalid answer.
    const scenario = structured.find((candidate) => candidate.kind === 'scenario');
    expect(scenario?.data.items.some(({ type }) => type === 'single-choice'), 'the scenario sample has a single-choice item').toBe(true);
    await page.emulateMedia({ colorScheme: scheme });
    await openWorkspace(page, scenario!);
    await page.getByRole('region', { name: 'Workspace' }).getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(resultPanel(page, 'Not graded')).toBeVisible();
    expect(await scan(page)).toEqual([]);
  });
}

test.describe('the guard catches planted slop', () => {
  const plants: Array<{ rule: Rule; css?: string; html?: string }> = [
    { rule: 'gradient', css: 'main { background-image: linear-gradient(#fff, #eee); }' },
    { rule: 'gradient', css: 'header::after { content: ""; background-image: radial-gradient(#fff, #000); }' },
    { rule: 'emoji', html: '<p>Saved \u{1F389}</p>' },
    { rule: 'emoji', html: '<p>Status ✔️</p>' },
    { rule: 'em dash', html: '<p>Fast — and free</p>' },
    { rule: 'box-shadow', css: 'main { box-shadow: 0 2px 8px rgb(0 0 0 / 20%); }' },
    { rule: 'border-radius', css: 'main { border-radius: 8px; }' },
    { rule: 'border-radius', css: 'main { border-radius: 50%; }' },
    { rule: 'border-radius', html: '<input type="radio" aria-label="planted" style="appearance: none; border-radius: 50%">' },
    { rule: 'backdrop-filter', css: 'header { backdrop-filter: blur(4px); }' },
    { rule: 'decorative image', html: '<svg width="8" height="8" aria-hidden="true"></svg>' },
    { rule: 'decorative image', html: '<img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">' },
    { rule: 'decorative image', css: 'header { background-image: url("data:image/gif;base64,R0lGODlhAQABAAAAACw="); }' },
  ];

  for (const { rule, css, html } of plants) {
    test(`${rule}: ${css ?? html}`, async ({ page }) => {
      await settle(page, '', 200);
      const before = (await scan(page)).filter((violation) => violation.rule === rule).length;
      if (css) await page.addStyleTag({ content: css });
      if (html) await page.locator('main').evaluate((main, markup) => main.insertAdjacentHTML('beforeend', markup), html);
      const after = (await scan(page)).filter((violation) => violation.rule === rule);
      expect(after.length, `planted ${rule} was not reported`).toBeGreaterThan(before);
    });
  }

  test('a soft focus shadow is reported and a focus ring is allowed', async ({ page }) => {
    // A short page with links: this walks every focus stop three times, and the practice list grows with content.
    await settle(page, 'tracks/', 200);
    const before = (await scanFocusStates(page)).filter(({ rule }) => rule === 'box-shadow').length;
    const ring = await page.addStyleTag({ content: 'a:focus-visible { box-shadow: 0 0 0 2px rgb(27 58 138); }' });
    expect((await scanFocusStates(page)).filter(({ rule }) => rule === 'box-shadow')).toHaveLength(before);
    await ring.evaluate((node) => (node as Element).remove());
    await page.addStyleTag({ content: 'a:focus-visible { box-shadow: 0 4px 12px rgb(0 0 0 / 30%); }' });
    expect((await scanFocusStates(page)).filter(({ rule }) => rule === 'box-shadow').length).toBeGreaterThan(before);
  });

  test('a control that takes focus without a ring is reported', async ({ page }) => {
    await settle(page, 'tracks/', 200);
    expect(await scanFocusStates(page), 'the page passes before the plant').toEqual([]);
    await page.addStyleTag({ content: 'a:focus, a:focus-visible { outline: none !important; box-shadow: none !important; }' });
    await expect(scanFocusStates(page)).rejects.toThrow(/has focus without a visible focus ring/);
  });
});
