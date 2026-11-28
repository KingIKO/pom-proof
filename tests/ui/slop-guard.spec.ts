import { readdirSync } from 'node:fs';
import { join, sep } from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { discoverProblems, onePerKind, root } from '../support/problems';
import { discoverQuestions, questionExamples } from '../support/questions';
import { expandQuestion } from '../support/review';
import { openWorkspace, resultPanel, submitStructured } from '../support/workspace';

// The redesign plan's slop guard (section 4), plus the Study diagram spec's clip-path ban: bans on
// decoration, radius by role, one shadow token,
// one filled primary per page state, a 2px focus ring at 3:1, the self-hosted Figtree face, and the
// first item of each list page above the fold at 1440x900. Light theme only.

type Rule =
  | 'gradient' | 'box-shadow' | 'text-shadow' | 'border-radius' | 'backdrop-filter' | 'blur'
  | 'emoji' | 'em dash' | 'decorative image' | 'filled primary' | 'stuck' | 'focus ring' | 'clip-path';
type Violation = { rule: Rule; where: string; value: string };
type FocusState = { label: string; key: string; ring: boolean; problems: Violation[] };

declare global {
  interface Window {
    __slopGuard?: { scan(): Violation[]; focusState(): FocusState | null };
  }
}

const prefix = '/pom-proof/';

/** The topic with the fewest questions, at least three, for the bank's focus walk. */
function walkTopic() {
  const counts = new Map<string, number>();
  for (const { folder } of discoverQuestions()) counts.set(folder, (counts.get(folder) ?? 0) + 1);
  const [topic] = [...counts].filter(([, count]) => count >= 3).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))[0] ?? [];
  if (!topic) throw new Error('no topic with three or more questions for the bank focus walk');
  return topic;
}

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
    .map((file) => file.split(sep).join('/').replace(/\.\w+$/, '').replace(/(^|\/)index$/, ''))
    // The fragments are checked in their host page by the expanded-card scans below.
    .filter((route) => route !== 'questions/fragments/[topic]/[id]');
  return routes.map((route): { route: string; urls: string[]; status: number; walk?: string } => {
    if (!route.includes('[')) {
      if (route === '404') return { route, urls: ['this-page-does-not-exist/'], status: 404 };
      // Every bank card is the same component, and walking all of them took the test past its 30 s
      // timeout once the bank reached 294 questions (2026-11-27). The focus walk uses the bank's own
      // topic filter: every control outside the list plus one topic's cards. The at-rest scan still
      // reads the whole bank, and the expanded-card tests walk a card's insides.
      if (route === 'questions') return { route, urls: ['questions/'], status: 200, walk: `questions/?topic=${walkTopic()}` };
      return { route, urls: [route ? `${route}/` : ''], status: 200 };
    }
    if (route === 'practice/[kind]/[id]') return { route, urls: onePerKind().map(({ path }) => path), status: 200 };
    if (route === 'editorials/[id]') return { route, urls: editorials.slice(0, 1).map((file) => `editorials/${file.slice(0, -3)}/`), status: 200 };
    // The question 2E built the page against; it has every answer section, sources included.
    if (route === 'questions/[topic]/[id]') return { route, urls: ['questions/playwright/independent-checkout-contexts/'], status: 200 };
    if (route === 'tracks/[role]') return { route, urls: tracks.slice(0, 1).map((file) => `tracks/${file.replace(/\.ya?ml$/, '')}/`), status: 200 };
    // The Study pilot module, and the page with the first concept diagram (plus a dispute and a
    // What changed box). Examples are scanned by the read-state test below.
    if (route === 'study/[module]') return { route, urls: ['study/framework-design/'], status: 200 };
    if (route === 'study/[module]/[page]') return { route, urls: ['study/testing-foundations/test-shapes/'], status: 200 };
    return { route, urls: [], status: 200 };
  });
}

/**
 * Installs the guard's checks in the page once per document. Everything here runs in the browser,
 * so it cannot use anything from this module.
 */
function installGuard() {
  if (window.__slopGuard) return;
  type Rgba = [number, number, number, number];
  type Found = { rule: Rule; where: string; value: string };

  // Any CSS colour, read back as 8-bit RGBA by painting one pixel.
  const paint = new OffscreenCanvas(1, 1).getContext('2d', { willReadFrequently: true })!;
  const colours = new Map<string, Rgba>();
  const rgba = (value: string): Rgba => {
    let colour = colours.get(value);
    if (!colour) {
      paint.clearRect(0, 0, 1, 1);
      paint.fillStyle = 'rgb(0 0 0 / 0)';
      paint.fillStyle = value;
      paint.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = paint.getImageData(0, 0, 1, 1).data;
      colour = [r, g, b, a / 255];
      colours.set(value, colour);
    }
    return colour;
  };
  const over = (top: Rgba, bottom: Rgba): Rgba => {
    const alpha = top[3] + bottom[3] * (1 - top[3]);
    if (alpha === 0) return [0, 0, 0, 0];
    const channel = (index: number) => (top[index] * top[3] + bottom[index] * bottom[3] * (1 - top[3])) / alpha;
    return [channel(0), channel(1), channel(2), alpha];
  };
  const luminance = (colour: Rgba) => {
    const [r, g, b] = colour.slice(0, 3).map((value) => {
      const c = value / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a: Rgba, b: Rgba) => {
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (light + 0.05) / (dark + 0.05);
  };
  const css = (colour: Rgba) => `rgb(${colour.slice(0, 3).map(Math.round).join(' ')})`;
  const styleOf = (element: Element, pseudo = '') => element.ownerDocument.defaultView!.getComputedStyle(element, pseudo || null);

  /** What is painted behind a point: the backgrounds of every box there, top first, over white. */
  const backdropAt = (doc: Document, x: number, y: number): Rgba | null => {
    const view = doc.defaultView!;
    if (x < 0 || y < 0 || x >= view.innerWidth || y >= view.innerHeight) return null;
    let colour: Rgba = [0, 0, 0, 0];
    for (const element of doc.elementsFromPoint(x, y)) {
      colour = over(colour, rgba(styleOf(element).backgroundColor));
      if (colour[3] >= 0.999) return colour;
    }
    return over(colour, [255, 255, 255, 1]);
  };

  const describe = (element: Element, pseudo = '') => {
    const id = element.id ? `#${element.id}` : element.getAttribute('type') ? `[type=${element.getAttribute('type')}]` : '';
    const classes = typeof element.className === 'string' && element.className.trim()
      ? `.${element.className.trim().split(/\s+/).slice(0, 3).join('.')}`
      : '';
    const text = (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return `${element.tagName.toLowerCase()}${id}${classes}${pseudo}${text ? ` "${text}"` : ''}`;
  };

  const shadows = (value: string) => (value === 'none' ? [] : value.split(/,(?![^(]*\))/).map((shadow) => {
    const colour = /[a-z-]+\([^)]*\)|#[0-9a-f]+/i.exec(shadow)?.[0] ?? 'currentcolor';
    const [x = 0, y = 0, blur = 0, spread = 0] = shadow
      .replace(/[a-z-]+\([^)]*\)/gi, '')
      .replace(/inset|#[0-9a-f]+|[a-z]+(?=\s|$)/gi, '')
      .trim()
      .split(/\s+/)
      .map(parseFloat);
    return { x, y, blur, spread, colour, inset: /\binset\b/.test(shadow) };
  }));
  /** The focus ring form: zero offset and blur, a positive spread. */
  const ringForm = (value: string) => {
    const list = shadows(value);
    return list.length > 0 && list.every(({ x, y, blur, spread }) => x === 0 && y === 0 && blur === 0 && spread > 0);
  };
  const tokenShadow = (() => {
    const probe = document.createElement('div');
    probe.style.boxShadow = 'var(--shadow-raised)';
    document.documentElement.append(probe);
    const value = getComputedStyle(probe).boxShadow;
    probe.remove();
    return value;
  })();
  /** A shadow other than the raised token on a dialog or a [data-stuck] bar, or a ring on the focused chain. */
  const shadowProblem = (element: Element, pseudo: string, style: CSSStyleDeclaration, focusChain: boolean) => {
    if (style.boxShadow === 'none') return null;
    if (!pseudo && (element.tagName === 'DIALOG' || element.hasAttribute('data-stuck')) && style.boxShadow === tokenShadow) return null;
    if (!pseudo && ringForm(style.boxShadow) && (focusChain || element.matches(':focus-visible'))) return null;
    return style.boxShadow;
  };

  // Radius by role: 0, 6px, 10px or a pill. Buttons and inputs that draw a box use 6px, [data-card]
  // uses 10px, and pills belong to [data-chip] and progress tracks. Native checkboxes and radios keep
  // the browser's shape.
  const controls = 'button, .button, input:not([type="checkbox"], [type="radio"], [type="hidden"]), select, textarea';
  const shows = (colour: Rgba) => colour[3] > 0.01;
  const drawsBox = (style: CSSStyleDeclaration) => shows(rgba(style.backgroundColor))
    || ['top', 'right', 'bottom', 'left'].every((side) => parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0
      && !['none', 'hidden'].includes(style.getPropertyValue(`border-${side}-style`))
      && shows(rgba(style.getPropertyValue(`border-${side}-color`))));
  const corners = ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'];
  const radiusProblem = (element: Element, style: CSSStyleDeclaration, pseudo: string) => {
    if (!pseudo && element.matches('input[type="checkbox"], input[type="radio"]') && style.appearance !== 'none') return null;
    const chip = element.matches('[data-chip], progress');
    const control = !pseudo && !chip && element.matches(controls) && drawsBox(style);
    const card = !pseudo && element.matches('[data-card]');
    let side: number | undefined;
    const shortSide = () => {
      if (side === undefined) {
        const rect = pseudo ? null : element.getBoundingClientRect();
        side = rect ? Math.min(rect.width, rect.height) : 0;
      }
      return side;
    };
    const classify = (part: string): 0 | 6 | 10 | 'pill' | 'other' => {
      const amount = parseFloat(part);
      if (part.endsWith('%')) return amount === 0 ? 0 : amount >= 50 ? 'pill' : 'other';
      for (const allowed of [0, 6, 10] as const) if (Math.abs(amount - allowed) < 0.05) return allowed;
      return amount >= 999 || (shortSide() > 0 && amount >= shortSide() / 2 - 0.05) ? 'pill' : 'other';
    };
    const values = corners.map((corner) => style.getPropertyValue(corner));
    for (const value of values) {
      const parts = value.split(/\s+/).filter(Boolean).map(classify);
      const kind = parts.every((part) => part === parts[0]) ? parts[0] : 'other';
      const all = values.join(' / ');
      if (kind === 'other') return `${all}: radii are 0, 6px, 10px or a pill`;
      if (kind === 'pill' && !chip) return `${all}: pills are only for [data-chip] and progress tracks`;
      if (control && kind !== 6) return `${all}: buttons and inputs use 6px`;
      if (card && kind !== 10) return `${all}: [data-card] uses 10px`;
    }
    return null;
  };

  /** Visible controls filled with the primary colour (or its hover shade). */
  const filledPrimaries = () => {
    const rootStyle = getComputedStyle(document.documentElement);
    const fills = ['--primary', '--primaryHover'].map((name) => rgba(rootStyle.getPropertyValue(name).trim())).filter(shows);
    if (!fills.length) return null;
    const same = (a: Rgba, b: Rgba) => a[3] > 0.5 && [0, 1, 2].every((index) => Math.abs(a[index] - b[index]) <= 2);
    return Array.from(document.querySelectorAll('a[href], button, input[type="submit"], input[type="button"], input[type="reset"], summary, [role="button"], .button, .primary'))
      .filter((element) => {
        if (!element.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && fills.some((fill) => same(rgba(getComputedStyle(element).backgroundColor), fill));
      });
  };

  const emoji = /[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Regional_Indicator}\u{FE0F}\u{20E3}]/u;
  const emDash = '—';

  /** Scans every element and pseudo-element in the page's current state, plus visible text and UI attributes. */
  const scan = (): Found[] => {
    const found: Found[] = [];
    const add = (rule: Rule, where: string, value: string) => found.push({ rule, where, value });

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
        const shadow = shadowProblem(element, pseudo, style, false);
        if (shadow) add('box-shadow', where, shadow);
        if (style.textShadow !== 'none') add('text-shadow', where, style.textShadow);
        if (style.backdropFilter !== 'none') add('backdrop-filter', where, style.backdropFilter);
        if (/blur|drop-shadow/.test(style.filter)) add('blur', where, style.filter);
        // Clipping cuts shapes out of boxes (diagram spec, Banned). inset(50%) clips a box to nothing:
        // that is the visually hidden pattern (.visually-hidden, the skip link at rest), so it passes.
        if (style.clipPath !== 'none' && style.clipPath !== 'inset(50%)') add('clip-path', where, style.clipPath);
        const radius = radiusProblem(element, style, pseudo);
        if (radius) add('border-radius', where, radius);
      }
    }

    for (const element of document.querySelectorAll('svg, img, picture, input[type="image"], object, embed')) {
      add('decorative image', describe(element), element.tagName.toLowerCase());
    }

    const filled = filledPrimaries();
    if (filled === null) add('filled primary', 'document', 'the --primary token is not defined');
    else if (filled.length > 1) add('filled primary', filled.map((element) => describe(element)).join('; '), `${filled.length} visible filled primary controls`);

    // data-stuck marks a sticky bar only while it sits at its sticky offset.
    for (const element of document.querySelectorAll('[data-stuck]')) {
      const style = getComputedStyle(element);
      const top = parseFloat(style.top);
      const stuck = style.position === 'sticky' && Number.isFinite(top) && Math.abs(element.getBoundingClientRect().top - top) <= 1;
      if (!stuck) add('stuck', describe(element), `position ${style.position}, top ${style.top}, at ${element.getBoundingClientRect().top.toFixed(1)}px`);
    }

    // Text inside closed disclosures counts too; they are put back as they were afterwards.
    const checkText = (text: string, where: string) => {
      const match = text.match(emoji);
      if (match) add('emoji', where, `U+${match[0].codePointAt(0)!.toString(16).toUpperCase()} in "${text.trim().slice(0, 60)}"`);
      if (text.includes(emDash)) add('em dash', where, text.trim().slice(0, 80));
    };
    const closed = Array.from(document.querySelectorAll('details')).filter((details) => !details.open);
    for (const details of closed) details.open = true;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, template, noscript')) continue;
      if (!parent.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      checkText((node as Text).data, describe(parent));
    }
    for (const details of closed) details.open = false;
    for (const element of document.querySelectorAll('[placeholder], [aria-label], [title], [alt], input[value]')) {
      for (const name of ['placeholder', 'aria-label', 'title', 'alt', 'value']) {
        const value = element.getAttribute(name);
        if (value) checkText(value, `${describe(element)} [${name}]`);
      }
    }
    checkText(document.title, 'document title');
    return found;
  };

  /**
   * The focused element, followed into a same-origin frame: its label, whether it or a wrapper shows
   * a ring, whether that ring is 2px, solid and 3:1 against what is painted behind it, and banned
   * styles on it and its ancestors. Null when nothing has focus.
   */
  const focusState = (): FocusState | null => {
    let active = document.activeElement;
    while (active?.tagName === 'IFRAME' && (active as HTMLIFrameElement).contentDocument?.activeElement) {
      const inner = (active as HTMLIFrameElement).contentDocument!.activeElement!;
      if (inner === inner.ownerDocument.body) break;
      active = inner;
    }
    if (!active || active === document.body) return null;
    const focused = active;
    const label = (element: Element) =>
      `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''} "${(element.textContent ?? '').trim().slice(0, 30)}"`;
    const up = (element: Element) => element.parentElement ?? (element.ownerDocument.defaultView!.frameElement as Element | null);

    type Ring = { host: Element; pseudo: string; style: CSSStyleDeclaration; kind: 'outline' | 'shadow' };
    const ringsOn = (element: Element, pseudos: string[]): Ring[] => pseudos.flatMap((pseudo) => {
      const style = styleOf(element, pseudo);
      if (pseudo && (style.content === 'none' || style.content === 'normal')) return [];
      const list: Ring[] = [];
      if (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) list.push({ host: element, pseudo, style, kind: 'outline' });
      if (ringForm(style.boxShadow)) list.push({ host: element, pseudo, style, kind: 'shadow' });
      return list;
    });
    let rings = ringsOn(focused, ['', '::before', '::after']);
    for (let element = up(focused); !rings.length && element && element !== document.body; element = up(element)) {
      rings = ringsOn(element, ['']);
    }

    const problems: Found[] = [];
    for (const ring of rings) {
      const where = `${label(ring.host)}${ring.pseudo} while ${label(focused)} has focus`;
      let width: number, offset: number, colour: string, lineStyle: string;
      if (ring.kind === 'outline') {
        width = parseFloat(ring.style.outlineWidth);
        offset = parseFloat(ring.style.outlineOffset) || 0;
        colour = ring.style.outlineColor;
        lineStyle = ring.style.outlineStyle;
      } else {
        const outer = shadows(ring.style.boxShadow).sort((a, b) => b.spread - a.spread)[0];
        width = outer.spread;
        offset = outer.inset ? -outer.spread : 0;
        colour = outer.colour;
        lineStyle = 'solid';
      }
      if (Math.abs(width - 2) > 0.05) problems.push({ rule: 'focus ring', where, value: `${ring.kind} is ${width}px; the ring is 2px` });
      if (lineStyle !== 'solid') problems.push({ rule: 'focus ring', where, value: `outline-style ${lineStyle}; the ring is solid` });

      // A positioned pseudo-element ring (a stretched link) is drawn around its containing block.
      let box = ring.host.getBoundingClientRect();
      if (ring.pseudo && /absolute|fixed/.test(ring.style.position)) {
        let holder: Element | null = ring.host;
        while (holder && styleOf(holder).position === 'static') holder = holder.parentElement;
        if (ring.style.position === 'fixed' || !holder) box = new DOMRect(0, 0, innerWidth, innerHeight);
        else box = holder.getBoundingClientRect();
      }
      const band = offset + width / 2;
      const middle = { x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 };
      const points = [[box.left - band, middle.y], [box.right + band, middle.y], [middle.x, box.top - band], [middle.x, box.bottom + band]];
      const ringColour = rgba(colour);
      let worst: { ratio: number; behind: Rgba } | null = null;
      for (const [x, y] of points) {
        const behind = backdropAt(ring.host.ownerDocument, x, y);
        if (!behind) continue;
        const ratio = contrast(over(ringColour, behind), behind);
        if (!worst || ratio < worst.ratio) worst = { ratio, behind };
      }
      if (worst && worst.ratio < 3 - 1e-6) {
        problems.push({ rule: 'focus ring', where, value: `${css(ringColour)} is ${worst.ratio.toFixed(2)}:1 against ${css(worst.behind)}; the ring needs 3:1` });
      }
    }

    for (let element: Element | null = focused; element; element = up(element)) {
      const style = styleOf(element);
      const where = `${label(element)} while ${label(focused)} has focus`;
      const shadow = shadowProblem(element, '', style, true);
      if (shadow) problems.push({ rule: 'box-shadow', where, value: shadow });
      if (style.backgroundImage.includes('gradient')) problems.push({ rule: 'gradient', where, value: style.backgroundImage });
      if (style.backdropFilter !== 'none') problems.push({ rule: 'backdrop-filter', where, value: style.backdropFilter });
      const radius = radiusProblem(element, style, '');
      if (radius) problems.push({ rule: 'border-radius', where, value: radius });
    }
    return {
      label: `${focused.tagName.toLowerCase()} "${(focused.textContent ?? '').trim().slice(0, 30)}"`,
      key: label(focused) + (focused.getAttribute('href') ?? ''),
      ring: rings.length > 0,
      problems,
    };
  };

  window.__slopGuard = { scan, focusState };
}

async function scan(page: Page): Promise<Violation[]> {
  await page.evaluate(installGuard);
  return page.evaluate(() => window.__slopGuard!.scan());
}

/** Violations grouped by rule, value and element (text left out), with a count, so a repeated row reads once. */
function grouped(violations: Violation[]) {
  const groups = new Map<string, Violation & { count: number }>();
  for (const violation of violations) {
    const key = `${violation.rule}|${violation.value}|${violation.where.replace(/ ".*$/s, '')}`;
    const group = groups.get(key);
    if (group) group.count += 1;
    else groups.set(key, { ...violation, count: 1 });
  }
  return [...groups.values()];
}

/** The focus state, with the guard installed by the caller; null once focus leaves `within` (when given). */
const readFocusState = (page: Page, within?: Locator) => within
  ? within.evaluate((container) => {
    const state = window.__slopGuard!.focusState();
    return state && container.contains(document.activeElement) ? state : null;
  })
  : page.evaluate(() => window.__slopGuard!.focusState());

/**
 * Tabs through every focusable control, or from the first control in `within` until focus leaves it.
 * Each stop needs a visible ring that passes the ring rules, and nothing else from the banned list on
 * the focused element and its ancestors.
 */
async function scanFocusStates(page: Page, { within, visited = [] }: { within?: Locator; visited?: string[] } = {}): Promise<Violation[]> {
  const found: Violation[] = [];
  await page.evaluate(installGuard);
  const focusable = 'a[href], button, input, select, textarea, summary, iframe, [tabindex], [contenteditable="true"]';
  if (within) {
    // Focus set from script after a click is not :focus-visible; stepping back with the keyboard
    // makes the first Tab land on the container's first control in keyboard mode.
    await within.locator(focusable).first().focus();
    await page.keyboard.press('Shift+Tab');
  } else {
    await page.locator('body').focus();
  }
  const limit = await page.evaluate((selector) => [document, ...Array.from(document.querySelectorAll('iframe'), (frame) => frame.contentDocument)]
    .reduce((total, doc) => total + (doc?.querySelectorAll(selector).length ?? 0), 0), focusable);
  expect(limit, 'page has no focusable controls').toBeGreaterThan(0);
  let first: string | null = null;
  for (let step = 0; step <= limit; step += 1) {
    await page.keyboard.press('Tab');
    // One read per step; when the ring is not there yet, poll until it is (CodeMirror adds
    // .cm-focused a moment after focus) and keep the state read once it shows.
    let state = await readFocusState(page, within);
    if (state === null) break;
    if (!state.ring) {
      const label = state.label;
      await expect.poll(async () => (state = await readFocusState(page, within))?.ring ?? false,
        { message: `${label} has focus without a visible focus ring` }).toBe(true);
    }
    if (state === null || state.key === first) break;
    first ??= state.key;
    visited.push(state.label);
    found.push(...state.problems);
  }
  return found;
}

/** Opens a page, waits for hydration, and returns the font requests it made. */
async function settle(page: Page, url: string, status: number) {
  const fonts: string[] = [];
  page.on('request', (request) => {
    if (request.resourceType() === 'font' || /\.(?:woff2?|ttf|otf)(?:[?#]|$)/i.test(request.url())) fonts.push(request.url());
  });
  const response = await page.goto(url);
  expect(response?.status(), `${url} status`).toBe(status);
  await expect(page.locator('main')).toBeVisible();
  // Astro removes the ssr attribute once an island hydrates.
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  return fonts;
}

/** Font requests that leave the site's origin or its /pom-proof/ base. */
const fontsOffBase = (fonts: string[], pageUrl: string) => fonts.filter((href) => {
  const url = new URL(href);
  return url.origin !== new URL(pageUrl).origin || !url.pathname.startsWith(prefix);
});

/**
 * The UI face: a loaded normal Figtree Variable face covering weight 500, `document.fonts.check`
 * agreeing, and the body family starting with it. `check` alone also passes when no face is
 * defined at all, so the loaded face is checked directly.
 */
function fontProblems(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    await document.fonts.ready;
    const family = 'Figtree Variable';
    const problems: string[] = [];
    const faces: FontFace[] = [];
    document.fonts.forEach((face) => {
      if (face.family.replace(/^["']|["']$/g, '') === family && face.style === 'normal') faces.push(face);
    });
    const covers500 = (face: FontFace) => {
      const [low, high = low] = face.weight.split(/\s+/).map(Number);
      return low <= 500 && 500 <= high;
    };
    if (!faces.some((face) => face.status === 'loaded' && covers500(face))) {
      problems.push(`no loaded normal "${family}" face covers weight 500 (${faces.map((face) => `${face.weight} ${face.status}`).join(', ') || 'none defined'})`);
    }
    if (!document.fonts.check(`500 16px "${family}"`)) problems.push(`document.fonts.check('500 16px "${family}"') is false`);
    const body = getComputedStyle(document.body).fontFamily;
    if (!/^["']?Figtree Variable["']?(?:,|$)/.test(body)) problems.push(`body font-family is ${body}`);
    return problems;
  });
}

const samples = pageSamples();

test('every page route has a sample for the guard', () => {
  expect(samples.length, 'no routes found under src/pages').toBeGreaterThan(0);
  expect(samples.filter(({ urls }) => urls.length === 0).map(({ route }) => route), 'routes with no sample URL').toEqual([]);
});

for (const { route, urls, status, walk } of samples) {
  for (const url of urls) {
    test(`/${url} (${route || 'index'}) has no slop`, async ({ page }) => {
      const fonts = await settle(page, url, status);
      await test.step('font', async () => {
        expect(await fontProblems(page), 'the Figtree face').toEqual([]);
        expect(fonts.length, 'font requests').toBeGreaterThan(0);
        expect(fontsOffBase(fonts, page.url()), `font requests outside ${prefix}`).toEqual([]);
      });
      await test.step('at rest', async () => expect(grouped(await scan(page)), 'at rest').toEqual([]));
      await test.step(walk ? `focus states on /${walk}` : 'focus states', async () => {
        if (walk) await settle(page, walk, status);
        expect(grouped(await scanFocusStates(page)), 'focus states').toEqual([]);
      });
    });
  }
}

test('questions: an expanded card and the stuck filter bar have no slop', async ({ page }) => {
  await settle(page, 'questions/', 200);
  const card = page.getByRole('list', { name: 'Questions' }).getByRole('listitem').first();
  await card.locator('summary').first().click();
  await expect(card.getByRole('group', { name: 'Rate your answer' })).toBeVisible();
  await test.step('expanded card at rest', async () => expect(grouped(await scan(page)), 'expanded card').toEqual([]));
  // The rest of the page was walked in its own test; this walks the card's own controls.
  await test.step('expanded card focus states', async () => {
    const visited: string[] = [];
    expect(grouped(await scanFocusStates(page, { within: card, visited })), 'expanded card focus states').toEqual([]);
    expect(visited.join('\n'), 'the walk reached the card controls').toMatch(/Solid[\s\S]*Open page/);
  });

  // Scrolled past the title band, the filter bar sits at its sticky offset.
  await page.mouse.move(0, 0);
  await page.evaluate(() => window.scrollTo(0, 900));
  const bar = page.locator('.filter-bar');
  await expect.poll(() => bar.evaluate((element) => Math.round(element.getBoundingClientRect().top - parseFloat(getComputedStyle(element).top))),
    { message: 'the filter bar is stuck after scrolling' }).toBe(0);
  test.info().annotations.push({ type: 'stuck filter bar', description: `data-stuck ${await bar.getAttribute('data-stuck') === null ? 'absent' : 'present'} while stuck` });
  expect(grouped(await scan(page)), 'stuck filter bar').toEqual([]);
});

const withExample = discoverQuestions().find((question) => questionExamples(question).some(({ variants }) => variants.length > 1));

test('questions: an expanded card with a switchable code example has no slop', async ({ page }) => {
  expect(withExample, 'a question with a multi-language example').toBeDefined();
  await settle(page, 'questions/', 200);
  const card = await expandQuestion(page, withExample!);
  const languages = card.getByRole('group', { name: 'Example language' }).first();
  await expect(languages).toBeVisible();
  await test.step('at rest', async () => expect(grouped(await scan(page)), 'expanded card with an example').toEqual([]));
  await test.step('focus states', async () => {
    const visited: string[] = [];
    expect(grouped(await scanFocusStates(page, { within: card, visited })), 'example focus states').toEqual([]);
    const names = (await languages.getByRole('button').allTextContents()).map((name) => name.trim());
    expect(visited.join('\n'), 'the walk reached the language buttons, Copy and the code').toMatch(
      new RegExp(`${names.join('[\\s\\S]*')}[\\s\\S]*Copy[\\s\\S]*\\npre "`));
  });
  await test.step('after switching language', async () => {
    await languages.getByRole('button').nth(1).click();
    await expect(languages.getByRole('button').nth(1)).toHaveAttribute('aria-pressed', 'true');
    expect(grouped(await scan(page)), 'switched example').toEqual([]);
  });
});

test('study: a page marked as read, with its example switched, has no slop', async ({ page }) => {
  await settle(page, 'study/framework-design/parameterised-tests/', 200);
  await page.getByRole('button', { name: 'Mark as read' }).click();
  await expect(page.getByRole('button', { name: 'Mark as unread' })).toBeVisible();
  await page.getByRole('group', { name: 'Example language' }).getByRole('button', { name: 'Python' }).click();
  expect(grouped(await scan(page)), 'read, example switched').toEqual([]);
  expect(grouped(await scanFocusStates(page)), 'read state focus states').toEqual([]);
});

test.describe('the first item is in view at 1440x900', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  const firstRow = (page: Page) => page.getByRole('table', { name: 'Practice problems' }).locator('tbody tr').first();
  const firstCard = (page: Page) => page.getByRole('list', { name: 'Questions' }).getByRole('listitem').first();

  test('the first problem row on /', async ({ page }) => {
    await settle(page, '', 200);
    await expect(firstRow(page)).toBeInViewport({ ratio: 1 });
  });

  test('the first question card on /questions/', async ({ page }) => {
    await settle(page, 'questions/', 200);
    await expect(firstCard(page)).toBeInViewport({ ratio: 1 });
  });

  test('plant: a tall block above the list pushes the first row and card out of view', async ({ page }) => {
    const spacer = (main: HTMLElement) => main.insertAdjacentHTML('afterbegin', '<div style="block-size: 900px"></div>');
    await settle(page, '', 200);
    await expect(firstRow(page)).toBeInViewport({ ratio: 1 });
    await page.locator('main').evaluate(spacer);
    await expect(firstRow(page)).not.toBeInViewport({ ratio: 1 });
    await settle(page, 'questions/', 200);
    await page.locator('main').evaluate(spacer);
    await expect(firstCard(page)).not.toBeInViewport({ ratio: 1 });
  });
});

const structured = discoverProblems().filter((problem): problem is Parameters<typeof submitStructured>[1] =>
  problem.kind === 'scenario' || problem.kind === 'diagnosis' || problem.kind === 'bug-report');

test('structured problems exist for the result-state scans', () => {
  expect(new Set(structured.map(({ kind }) => kind))).toEqual(new Set(['scenario', 'diagnosis', 'bug-report']));
});

for (const kind of ['scenario', 'diagnosis', 'bug-report'] as const) {
  const problem = structured.find((candidate) => candidate.kind === kind);
  test(`${kind} result states (fail, pass) have no slop`, async ({ page }) => {
    expect(problem, `a ${kind} problem`).toBeDefined();
    await openWorkspace(page, problem!);
    await submitStructured(page, problem!, 'decoy');
    expect(grouped(await scan(page)), 'fail').toEqual([]);
    await page.getByRole('region', { name: 'Workspace' }).getByRole('button', { name: 'Try again', exact: true }).click();
    await submitStructured(page, problem!, 'reference');
    expect(grouped(await scan(page)), 'pass').toEqual([]);
  });
}

test('the not-graded result state has no slop', async ({ page }) => {
  // An empty scenario submit leaves its single-choice item unanswered, which is an invalid answer.
  const scenario = structured.find((candidate) => candidate.kind === 'scenario');
  expect(scenario?.data.items.some(({ type }) => type === 'single-choice'), 'the scenario sample has a single-choice item').toBe(true);
  await openWorkspace(page, scenario!);
  await page.getByRole('region', { name: 'Workspace' }).getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(resultPanel(page, 'Not graded')).toBeVisible();
  expect(grouped(await scan(page))).toEqual([]);
});

test.describe('the guard catches planted slop', () => {
  const plants: Array<{ rule: Rule; css?: string; html?: string; allowed?: boolean }> = [
    { rule: 'gradient', css: 'main { background-image: linear-gradient(#fff, #eee); }' },
    { rule: 'gradient', css: 'header::after { content: ""; background-image: radial-gradient(#fff, #000); }' },
    { rule: 'emoji', html: '<p>Saved \u{1F389}</p>' },
    { rule: 'emoji', html: '<p>Status ✔️</p>' },
    { rule: 'emoji', html: '<details><summary>More</summary><p>Hidden \u{1F680}</p></details>' },
    { rule: 'em dash', html: '<p>Fast — and free</p>' },
    { rule: 'box-shadow', css: 'main { box-shadow: 0 2px 8px rgb(0 0 0 / 20%); }' },
    { rule: 'box-shadow', css: 'main { box-shadow: var(--shadow-raised); }' },
    { rule: 'box-shadow', html: '<dialog open style="box-shadow: 0 0 24px rgb(0 0 0 / 40%)">Planted</dialog>' },
    { rule: 'box-shadow', html: '<dialog open>Planted</dialog>', allowed: true },
    { rule: 'stuck', html: '<div data-stuck style="box-shadow: var(--shadow-raised)">Planted bar</div>' },
    { rule: 'border-radius', css: 'main { border-radius: 8px; }' },
    { rule: 'border-radius', css: 'main { border-radius: 50%; }' },
    { rule: 'border-radius', html: '<div style="border-radius: 999px; padding: 4px">Planted pill</div>' },
    { rule: 'border-radius', html: '<span data-chip style="border-radius: 999px; padding: 4px">Planted chip</span>', allowed: true },
    { rule: 'border-radius', html: '<button type="button" class="button outline" style="border-radius: 10px">Planted</button>' },
    { rule: 'border-radius', html: '<input class="input" aria-label="Planted" style="border-radius: 0">' },
    { rule: 'border-radius', html: '<div data-card style="border-radius: 6px">Planted card</div>' },
    { rule: 'border-radius', html: '<div data-card>Planted card</div>', allowed: true },
    { rule: 'border-radius', html: '<input type="radio" aria-label="planted" style="appearance: none; border-radius: 50%">' },
    { rule: 'backdrop-filter', css: 'header { backdrop-filter: blur(4px); }' },
    { rule: 'blur', css: 'main { filter: blur(1px); }' },
    { rule: 'text-shadow', css: 'h1 { text-shadow: 0 1px 2px rgb(0 0 0 / 30%); }' },
    { rule: 'clip-path', css: 'main { clip-path: inset(0); }' },
    { rule: 'clip-path', html: '<div style="clip-path: polygon(50% 0, 100% 100%, 0 100%); block-size: 40px">Planted shape</div>' },
    { rule: 'clip-path', html: '<span class="visually-hidden">Planted hidden text</span>', allowed: true },
    { rule: 'filled primary', html: '<button type="button" class="button primary">Planted one</button><button type="button" class="button primary">Planted two</button>' },
    { rule: 'decorative image', html: '<svg width="8" height="8" aria-hidden="true"></svg>' },
    { rule: 'decorative image', html: '<img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">' },
    // The site header sets its own background, so the image goes on main.
    { rule: 'decorative image', css: 'main { background-image: url("data:image/gif;base64,R0lGODlhAQABAAAAACw="); }' },
  ];

  for (const { rule, css, html, allowed } of plants) {
    test(`${allowed ? 'allowed' : rule}: ${css ?? html}`, async ({ page }) => {
      await settle(page, '', 200);
      const before = (await scan(page)).filter((violation) => violation.rule === rule).length;
      if (css) await page.addStyleTag({ content: css });
      if (html) await page.locator('main').evaluate((main, markup) => main.insertAdjacentHTML('beforeend', markup), html);
      const after = (await scan(page)).filter((violation) => violation.rule === rule);
      if (allowed) expect(after, `the allowed ${rule} plant was reported`).toHaveLength(before);
      else expect(after.length, `planted ${rule} was not reported`).toBeGreaterThan(before);
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

  for (const [name, plant, expected] of [
    ['a 1px ring', 'a:focus-visible { outline-width: 1px !important; }', /is 1px; the ring is 2px/],
    ['a dotted ring', 'a:focus-visible { outline-style: dotted !important; }', /outline-style dotted/],
    ['a pale ring', 'a:focus-visible { outline-color: #E3E7F2 !important; }', /:1 against .*the ring needs 3:1/],
    ['a ring the same colour as the header', 'a:focus-visible { outline-color: #101A33 !important; }', /:1 against .*the ring needs 3:1/],
  ] as const) {
    test(`${name} is reported`, async ({ page }) => {
      await settle(page, 'tracks/', 200);
      await page.addStyleTag({ content: plant });
      const found = (await scanFocusStates(page)).filter(({ rule }) => rule === 'focus ring');
      expect(found.length, `${name} was not reported`).toBeGreaterThan(0);
      expect(found.map(({ value }) => value).join('\n')).toMatch(expected);
    });
  }

  test('a body font other than Figtree is reported', async ({ page }) => {
    await settle(page, '', 200);
    expect(await fontProblems(page)).toEqual([]);
    await page.addStyleTag({ content: 'body { font-family: system-ui !important; }' });
    expect((await fontProblems(page)).join('\n')).toMatch(/body font-family is system-ui/);
  });

  test('a missing Figtree face is reported although document.fonts.check passes', async ({ page }) => {
    await settle(page, '', 200);
    const checkAfter = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        for (let index = sheet.cssRules.length - 1; index >= 0; index -= 1) {
          const rule = sheet.cssRules[index];
          if (rule instanceof CSSFontFaceRule && /Figtree/.test(rule.style.getPropertyValue('font-family'))) sheet.deleteRule(index);
        }
      }
      return document.fonts.check('500 16px "Figtree Variable"');
    });
    test.info().annotations.push({ type: 'fonts.check with no face', description: String(checkAfter) });
    expect((await fontProblems(page)).join('\n')).toMatch(/no loaded normal "Figtree Variable" face covers weight 500 \(none defined\)/);
  });

  test('an unloaded Figtree face makes document.fonts.check fail', async ({ page }) => {
    await settle(page, '', 200);
    // The stylesheet's face is replaced by a weight 500 face that no text uses, so it stays unloaded
    // (a face that fails to load counts as settled, and the check passes again).
    await page.addStyleTag({ content: '* { font-family: serif !important; }' });
    await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        for (let index = sheet.cssRules.length - 1; index >= 0; index -= 1) {
          const rule = sheet.cssRules[index];
          if (rule instanceof CSSFontFaceRule && /Figtree/.test(rule.style.getPropertyValue('font-family'))) sheet.deleteRule(index);
        }
      }
      document.fonts.add(new FontFace('Figtree Variable', 'url(data:font/woff2;base64,AAAA)', { weight: '500' }));
    });
    expect((await fontProblems(page)).join('\n')).toMatch(/document\.fonts\.check\('500 16px "Figtree Variable"'\) is false/);
  });

  test('a font request outside the base is reported', async ({ page }) => {
    await page.route('https://fonts.example.invalid/**', (route) => route.fulfill({ status: 404, body: '' }));
    const fonts = await settle(page, '', 200);
    expect(fontsOffBase(fonts, page.url())).toEqual([]);
    await page.addStyleTag({ content: '@font-face { font-family: Planted; src: url(https://fonts.example.invalid/planted.woff2); } main { font-family: Planted, sans-serif; }' });
    await expect.poll(() => fontsOffBase(fonts, page.url())).toEqual(['https://fonts.example.invalid/planted.woff2']);
  });
});
