/*
  Locator engine for CSS, XPath and a Playwright-style API (getByRole,
  getByText, getByLabel, getByPlaceholder, getByAltText, getByTitle,
  getByTestId, locator, filter, nth/first/last, and/or).

  Roles and accessible names follow the ARIA in HTML and accname rules for
  the elements practice pages use. It is a teaching subset, not a full
  reimplementation of Playwright's selector engine.
*/

export type Strategy = 'css' | 'xpath' | 'playwright';
type TextMatch = string | RegExp;

export function detectStrategy(expr: string): Strategy {
  const s = expr.trim();
  if (/^(page\s*\.|getBy|locator\()/.test(s)) return 'playwright';
  if (/^(\/|\(|\.\/|\.\.)/.test(s) || /^xpath=/.test(s)) return 'xpath';
  return 'css';
}

const norm = (s: string) => s.replace(/[\u200b\u00ad]/g, '').trim().replace(/\s+/g, ' ');

function rawMatches(value: string, match: TextMatch, exact = false): boolean {
  if (match instanceof RegExp) return new RegExp(match).test(value);
  return exact ? value === match : value.toLowerCase().includes(match.toLowerCase());
}

function textMatches(value: string, m: TextMatch, exact = false): boolean {
  return m instanceof RegExp ? rawMatches(value, m) : rawMatches(norm(value), norm(m), exact);
}

/* ---------------- visibility ---------------- */

export function isHidden(el: Element): boolean {
  for (let cur: Element | null = el; cur; cur = cur.parentElement) {
    if (cur.getAttribute('aria-hidden') === 'true') return true;
    const tag = cur.localName;
    if (['style', 'script', 'noscript', 'template'].includes(tag)) return true;
    const view = cur.ownerDocument.defaultView;
    if (view) {
      const cs = view.getComputedStyle(cur);
      if (cs.display === 'none') return true;
      if (cur === el && cs.visibility !== 'visible') return true;
    } else if (cur.hasAttribute('hidden') || tag === 'head') {
      return true;
    }
    if (tag === 'details' && cur !== el && !(cur as HTMLDetailsElement).open) {
      const summary = Array.from(cur.children).find((child) => child.localName === 'summary');
      if (!summary || !summary.contains(el)) return true;
    }
  }
  return false;
}

/* ---------------- roles ---------------- */

const VALID_ROLES = new Set((
  'alert alertdialog application article banner blockquote button caption cell checkbox code columnheader combobox ' +
  'complementary contentinfo definition deletion dialog directory document emphasis feed figure form generic grid gridcell ' +
  'group heading img insertion link list listbox listitem log main mark marquee math meter menu menubar menuitem ' +
  'menuitemcheckbox menuitemradio navigation none note option paragraph presentation progressbar radio radiogroup region ' +
  'row rowgroup rowheader scrollbar search searchbox separator slider spinbutton status strong subscript superscript switch ' +
  'tab table tablist tabpanel term textbox time timer toolbar tooltip tree treegrid treeitem'
).split(' '));
const GLOBAL_ARIA = (
  'atomic busy controls current describedby details dropeffect flowto grabbed hidden keyshortcuts label labelledby ' +
  'live owns relevant roledescription'
).split(' ');
const GLOBAL_LABEL_EXCLUDED = new Set([
  'caption', 'code', 'deletion', 'emphasis', 'generic', 'insertion', 'paragraph', 'presentation', 'strong', 'subscript', 'superscript',
]);
const LANDMARK_ANCESTOR = 'article:not([role]), aside:not([role]), main:not([role]), nav:not([role]), section:not([role]), ' +
  '[role=article], [role=complementary], [role=main], [role=navigation], [role=region]';
const DATALIST_TYPES = ['email', 'search', 'tel', 'text', 'url'];
const PLACEHOLDER_TYPES = [...DATALIST_TYPES, 'password', 'number'];

function explicitRole(el: Element): string | null {
  return el.getAttribute('role')?.toLowerCase().split(' ').map((role) => role.trim())
    .find((role) => VALID_ROLES.has(role)) ?? null;
}

function hasGlobalAria(el: Element, role: string | null): boolean {
  return GLOBAL_ARIA.some((attr) => {
    if ((attr === 'label' || attr === 'labelledby') && role && GLOBAL_LABEL_EXCLUDED.has(role)) return false;
    if (attr === 'roledescription' && role === 'generic') return false;
    return el.hasAttribute(`aria-${attr}`);
  });
}

function hasTabIndex(el: Element): boolean {
  return el.hasAttribute('tabindex') && !Number.isNaN(Number(el.getAttribute('tabindex')));
}

function isFocusable(el: Element): boolean {
  const tag = el.localName;
  const nativeControl = ['button', 'input', 'option', 'optgroup', 'select', 'textarea'].includes(tag);
  if (nativeControl && (el.matches(':disabled') || el.closest('optgroup[disabled]'))) return false;
  return hasTabIndex(el) || ['button', 'details', 'select', 'textarea'].includes(tag) ||
    (tag === 'input' && !el.hasAttribute('hidden')) || (['a', 'area'].includes(tag) && el.hasAttribute('href'));
}

function idRefs(el: Element, attr: string): Element[] {
  const root = el.getRootNode() as Document | ShadowRoot;
  const ids = el.getAttribute(attr)?.trim().split(/\s+/) ?? [];
  return Array.from(new Set(ids.flatMap((id) => {
    const target = root.getElementById?.(id);
    return target ? [target] : [];
  })));
}

export function getRole(el: Element): string | null {
  const explicit = explicitRole(el);
  if (!explicit) return implicitRole(el);
  if (explicit !== 'none' && explicit !== 'presentation') return explicit;
  const implicit = implicitRole(el);
  return hasGlobalAria(el, implicit) || isFocusable(el) ? implicit : explicit;
}

function implicitRole(el: Element): string | null {
  const tag = el.localName;
  switch (tag) {
    case 'a':
    case 'area':
      return el.hasAttribute('href') ? 'link' : null;
    case 'button':
      return 'button';
    case 'input': {
      const type = (el as HTMLInputElement).type;
      if (['button', 'submit', 'reset', 'image', 'file'].includes(type)) return 'button';
      if (type === 'checkbox') return 'checkbox';
      if (type === 'radio') return 'radio';
      if (type === 'range') return 'slider';
      if (type === 'number') return 'spinbutton';
      if (type === 'hidden') return null;
      if (DATALIST_TYPES.includes(type) && idRefs(el, 'list')[0]?.localName === 'datalist') return 'combobox';
      return type === 'search' ? 'searchbox' : 'textbox';
    }
    case 'textarea':
      return 'textbox';
    case 'select':
      return el.hasAttribute('multiple') || Number(el.getAttribute('size') ?? 0) > 1 ? 'listbox' : 'combobox';
    case 'option':
      return 'option';
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'heading';
    case 'img':
      return el.getAttribute('alt') === '' && !el.getAttribute('title') &&
        !hasGlobalAria(el, 'img') && !hasTabIndex(el) ? 'presentation' : 'img';
    case 'ul':
    case 'ol':
    case 'menu':
      return 'list';
    case 'li':
      return 'listitem';
    case 'table':
      return 'table';
    case 'tr':
      return 'row';
    case 'td': {
      const table = el.closest('table');
      const role = table && explicitRole(table);
      return role === 'grid' || role === 'treegrid' ? 'gridcell' : 'cell';
    }
    case 'th': {
      const scope = el.getAttribute('scope');
      if (scope === 'col' || scope === 'colgroup') return 'columnheader';
      if (scope === 'row' || scope === 'rowgroup') return 'rowheader';
      const prev = el.previousElementSibling;
      const next = el.nextElementSibling;
      if (!prev && !next) {
        const table = el.parentElement?.localName === 'tr' ? el.closest('table') : null;
        if (table && table.rows.length <= 1 && el.parentElement?.parentElement?.localName !== 'thead') return null;
        return 'columnheader';
      }
      if (prev?.localName === 'th' && next?.localName === 'th') return 'columnheader';
      return [prev, next].some((cell) => cell?.localName === 'td' && (cell.textContent?.trim() || cell.children.length))
        ? 'rowheader' : 'columnheader';
    }
    case 'thead':
    case 'tbody':
    case 'tfoot':
      return 'rowgroup';
    case 'nav':
      return 'navigation';
    case 'main':
      return 'main';
    case 'header':
      return el.parentElement?.closest(LANDMARK_ANCESTOR) ? null : 'banner';
    case 'footer':
      return el.parentElement?.closest(LANDMARK_ANCESTOR) ? null : 'contentinfo';
    case 'aside':
      return 'complementary';
    case 'form':
      return el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby') ? 'form' : null;
    case 'section':
      return el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby') ? 'region' : null;
    case 'article':
      return 'article';
    case 'dialog':
      return 'dialog';
    case 'fieldset':
    case 'details':
      return 'group';
    case 'progress':
      return 'progressbar';
    case 'hr':
      return 'separator';
    case 'output':
      return 'status';
    case 'p':
      return 'paragraph';
    default:
      return null;
  }
}

const NAME_FROM_CONTENT = new Set([
  'button', 'cell', 'checkbox', 'columnheader', 'gridcell', 'heading', 'link', 'menuitem', 'menuitemcheckbox',
  'menuitemradio', 'option', 'radio', 'row', 'rowheader', 'switch', 'tab', 'tooltip', 'treeitem',
]);

function labelsFor(el: Element): Element[] {
  if (['button', 'meter', 'output', 'progress', 'select', 'textarea'].includes(el.localName) ||
    (el.localName === 'input' && (el as HTMLInputElement).type !== 'hidden')) {
    return Array.from((el as HTMLInputElement).labels ?? []);
  }
  return [];
}

function skipLocatorText(el: Element): boolean {
  return ['script', 'style', 'noscript'].includes(el.localName) || !!el.ownerDocument.head?.contains(el);
}

function locatorText(el: Element, cache: Map<Element, string>): string {
  const cached = cache.get(el);
  if (cached !== undefined) return cached;
  let text = '';
  if (!skipLocatorText(el)) {
    if (el.localName === 'input' && ['button', 'submit', 'reset'].includes((el as HTMLInputElement).type)) {
      text = (el as HTMLInputElement).value;
    } else {
      for (const child of el.childNodes) {
        if (child.nodeType === 3) text += child.nodeValue ?? '';
        else if (child.nodeType === 1) text += locatorText(child as Element, cache);
      }
    }
  }
  cache.set(el, text);
  return text;
}

function locatorLabels(el: Element, cache: Map<Element, string>): string[] {
  const refs = idRefs(el, 'aria-labelledby');
  if (refs.length) return refs.map((target) => locatorText(target, cache));
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel?.trim()) return [ariaLabel];
  return labelsFor(el).map((label) => locatorText(label, cache));
}

function textFrom(node: Node, skip?: Element): string {
  let out = '';
  node.childNodes.forEach((c) => {
    if (c.nodeType === 3) out += c.textContent ?? '';
    else if (c.nodeType === 1) {
      const e = c as Element;
      if (e === skip || isHidden(e)) return;
      const tag = e.tagName.toLowerCase();
      if (['input', 'select', 'textarea'].includes(tag)) return;
      if (e.getAttribute('aria-label')) out += ' ' + e.getAttribute('aria-label') + ' ';
      else if (tag === 'img') out += ' ' + (e.getAttribute('alt') ?? '') + ' ';
      else {
        const block = /^(div|p|li|tr|td|th|br|h[1-6]|section|article)$/.test(tag);
        out += (block ? ' ' : '') + textFrom(e, skip) + (block ? ' ' : '');
      }
    }
  });
  return out;
}

export function accessibleName(el: Element): string {
  const refs = idRefs(el, 'aria-labelledby');
  if (refs.length) {
    const t = refs.map((e) => textFrom(e)).join(' ');
    if (norm(t)) return norm(t);
  }
  const al = el.getAttribute('aria-label');
  if (al && norm(al)) return norm(al);
  const tag = el.localName;
  const type = tag === 'input' ? (el as HTMLInputElement).type : '';
  const title = norm(el.getAttribute('title') ?? '');
  if (tag === 'input' && ['button', 'submit', 'reset'].includes(type)) {
    return norm((el as HTMLInputElement).value) || (type === 'submit' ? 'Submit' : type === 'reset' ? 'Reset' : title);
  }
  const labels = labelsFor(el);
  if (labels.length) return norm(labels.map((label) => textFrom(label, el)).join(' '));
  if (type === 'file') return 'Choose File';
  if (type === 'image') return norm(el.getAttribute('alt') ?? '') || title || 'Submit';
  if (tag === 'textarea' || (tag === 'input' && PLACEHOLDER_TYPES.includes(type))) {
    return title || norm(el.getAttribute('placeholder') ?? '');
  }
  if (tag === 'img' || tag === 'area') return norm(el.getAttribute('alt') ?? '') || title;
  if (tag === 'fieldset') {
    const lg = el.querySelector(':scope > legend');
    if (lg) return norm(textFrom(lg));
  }
  if (tag === 'table') {
    const cap = el.querySelector(':scope > caption');
    if (cap) return norm(textFrom(cap));
  }
  const role = getRole(el);
  if (role && NAME_FROM_CONTENT.has(role)) {
    const t = norm(textFrom(el));
    if (t) return t;
  }
  return title;
}

function headingLevel(el: Element): number | undefined {
  const al = el.getAttribute('aria-level');
  if (al) return Number(al);
  const m = el.tagName.match(/^H([1-6])$/i);
  return m ? Number(m[1]) : undefined;
}

function isChecked(el: Element): boolean | 'mixed' {
  const ac = el.getAttribute('aria-checked');
  if (ac === 'mixed') return 'mixed';
  if (ac) return ac === 'true';
  return !!(el as HTMLInputElement).checked;
}

export function isDisabled(el: Element): boolean {
  if (el.getAttribute('aria-disabled') === 'true') return true;
  if ((el as HTMLButtonElement).disabled) return true;
  const fs = el.closest('fieldset[disabled]');
  return !!fs && !fs.querySelector(':scope > legend')?.contains(el);
}

/* ---------------- locators ---------------- */

type Query = () => Element[];
type Step = (elements: Element[], root?: Element) => Element[];
const pageQueries = new WeakSet<Query>();

function docOrder(els: Element[]): Element[] {
  const uniq = Array.from(new Set(els));
  return uniq.sort((a, b) => (a === b ? 0 : a.compareDocumentPosition(b) & 4 ? -1 : 1));
}

function cssWithin(root: Element, sel: string, includeSelf = false): Element[] {
  try {
    const found = Array.from(root.querySelectorAll(sel));
    if (includeSelf && root.matches(sel)) found.unshift(root);
    return found;
  } catch {
    throw new LocatorError(`Invalid CSS selector: ${sel}`);
  }
}

function xpathWithin(root: Node, expr: string): Element[] {
  const doc = root.ownerDocument ?? (root as Document);
  let r: XPathResult;
  try {
    r = doc.evaluate(expr, root, null, 7 /* ORDERED_NODE_SNAPSHOT_TYPE */, null);
  } catch {
    throw new LocatorError(`Invalid XPath: ${expr}`);
  }
  const out: Element[] = [];
  for (let i = 0; i < r.snapshotLength; i++) {
    const n = r.snapshotItem(i);
    if (n && n.nodeType === 1) out.push(n as Element);
  }
  return out;
}

export class LocatorError extends Error {
  constructor(m: string) {
    super(m);
    this.name = 'LocatorError';
  }
}

export interface RoleOptions {
  name?: TextMatch;
  exact?: boolean;
  level?: number;
  checked?: boolean;
  disabled?: boolean;
  expanded?: boolean;
  selected?: boolean;
  pressed?: boolean;
  includeHidden?: boolean;
}

export class Locator {
  readonly description: string;
  private readonly q: Query;
  private steps: readonly Step[] = [];

  constructor(q: Query, description: string) {
    this.q = q;
    this.description = description;
  }

  /** All matching elements, in document order. */
  all(): Element[] {
    return this.apply(this.q());
  }

  count(): number {
    return this.all().length;
  }

  private apply(elements: Element[], root?: Element): Element[] {
    return this.steps.reduce((matches, step) => step(matches, root), elements);
  }

  private resolve(root: Element): Element[] {
    if (!pageQueries.has(this.q)) return this.all().filter((el) => el !== root && root.contains(el));
    return this.steps.length ? this.apply([root], root) : [];
  }

  private step(desc: string, step: Step): Locator {
    const result = new Locator(this.q, `${this.description}.${desc}`);
    result.steps = [...this.steps, step];
    return result;
  }

  private chain(desc: string, within: (root: Element) => Element[]): Locator {
    return this.step(desc, (elements) => docOrder(elements.flatMap(within)));
  }

  getByRole(role: string, opts: RoleOptions = {}): Locator {
    if (typeof role !== 'string') throw new LocatorError('getByRole needs a role name, like getByRole("button")');
    const name = role.toLowerCase();
    const known = ['name', 'exact', 'level', 'checked', 'disabled', 'expanded', 'selected', 'pressed', 'includeHidden'];
    for (const k of Object.keys(opts)) if (!known.includes(k)) throw new LocatorError(`getByRole does not take an option named "${k}"`);
    return this.chain(`getByRole(${JSON.stringify(role)}${Object.keys(opts).length ? ', ' + fmtOpts(opts) : ''})`, (root) =>
      Array.from(root.querySelectorAll('*')).filter((el) => {
        if (getRole(el) !== name) return false;
        if (!opts.includeHidden && isHidden(el)) return false;
        if (opts.name !== undefined && !textMatches(accessibleName(el), opts.name, opts.exact)) return false;
        if (opts.level !== undefined && headingLevel(el) !== opts.level) return false;
        if (opts.checked !== undefined && isChecked(el) !== opts.checked) return false;
        if (opts.disabled !== undefined && isDisabled(el) !== opts.disabled) return false;
        if (opts.expanded !== undefined && (el.getAttribute('aria-expanded') === 'true') !== opts.expanded) return false;
        if (opts.selected !== undefined && ((el.getAttribute('aria-selected') === 'true' || (el as HTMLOptionElement).selected === true) !== opts.selected)) return false;
        if (opts.pressed !== undefined && (el.getAttribute('aria-pressed') === 'true') !== opts.pressed) return false;
        return true;
      }),
    );
  }

  getByText(text: TextMatch, opts: { exact?: boolean } = {}): Locator {
    return this.chain(`getByText(${fmtMatch(text)}${opts.exact ? ', { exact: true }' : ''})`, (root) => {
      const cache = new Map<Element, string>();
      const matches = [root, ...root.querySelectorAll('*')].filter((el) =>
        !skipLocatorText(el) && textMatches(locatorText(el, cache), text, opts.exact));
      const parents = new Set<Element>();
      for (const el of matches) {
        for (let parent = el.parentElement; parent && !parents.has(parent); parent = parent.parentElement) {
          parents.add(parent);
        }
      }
      return matches.filter((el) => !parents.has(el));
    });
  }

  getByLabel(text: TextMatch, opts: { exact?: boolean } = {}): Locator {
    return this.chain(`getByLabel(${fmtMatch(text)}${opts.exact ? ', { exact: true }' : ''})`, (root) => {
      const cache = new Map<Element, string>();
      return Array.from(root.querySelectorAll('*')).filter((el) =>
        locatorLabels(el, cache).some((name) => textMatches(name, text, opts.exact)));
    });
  }

  private attrMatch(desc: string, attr: string, text: TextMatch, exact?: boolean) {
    return this.chain(desc, (root) => cssWithin(root, `[${attr}]`).filter((el) => rawMatches(el.getAttribute(attr)!, text, exact)));
  }

  getByPlaceholder(text: TextMatch, opts: { exact?: boolean } = {}) {
    return this.attrMatch(`getByPlaceholder(${fmtMatch(text)})`, 'placeholder', text, opts.exact);
  }

  getByAltText(text: TextMatch, opts: { exact?: boolean } = {}) {
    return this.attrMatch(`getByAltText(${fmtMatch(text)})`, 'alt', text, opts.exact);
  }

  getByTitle(text: TextMatch, opts: { exact?: boolean } = {}) {
    return this.attrMatch(`getByTitle(${fmtMatch(text)})`, 'title', text, opts.exact);
  }

  getByTestId(id: TextMatch) {
    return this.chain(`getByTestId(${fmtMatch(id)})`, (root) =>
      cssWithin(root, '[data-testid]').filter((el) => {
        const v = el.getAttribute('data-testid') ?? '';
        return id instanceof RegExp ? id.test(v) : v === id;
      }),
    );
  }

  locator(selector: string, opts: { hasText?: TextMatch; has?: Locator } = {}): Locator {
    if (typeof selector !== 'string') throw new LocatorError('locator() needs a CSS or XPath string');
    const base = this.chain(`locator(${JSON.stringify(selector)})`, (root) => {
      let s = selector.trim();
      if (s.startsWith('css=')) return cssWithin(root, s.slice(4));
      const isX = s.startsWith('xpath=') || s.startsWith('/') || /^\(*\/\//.test(s) || s.startsWith('..');
      if (isX) {
        s = s.replace(/^xpath=/, '');
        // Like Playwright, a chained XPath that starts with // searches under the parent.
        if (root !== root.ownerDocument.documentElement && s.startsWith('/')) s = '.' + s;
        return xpathWithin(root, s);
      }
      return cssWithin(root, s);
    });
    return opts.hasText !== undefined || opts.has ? base.filter(opts) : base;
  }

  filter(opts: { hasText?: TextMatch; hasNotText?: TextMatch; has?: Locator; hasNot?: Locator; visible?: boolean } = {}): Locator {
    return this.step(`filter(${fmtOpts(opts)})`, (elements) => {
      const cache = new Map<Element, string>();
      return elements.filter((el) => {
        if (opts.hasText !== undefined && !textMatches(locatorText(el, cache), opts.hasText)) return false;
        if (opts.hasNotText !== undefined && textMatches(locatorText(el, cache), opts.hasNotText)) return false;
        if (opts.has && !opts.has.resolve(el).length) return false;
        if (opts.hasNot && opts.hasNot.resolve(el).length) return false;
        if (opts.visible !== undefined && isHidden(el) === opts.visible) return false;
        return true;
      });
    });
  }

  nth(i: number): Locator {
    return this.step(`nth(${i})`, (elements) => {
      const el = i < 0 ? elements[elements.length + i] : elements[i];
      return el ? [el] : [];
    });
  }

  first() {
    return this.nth(0);
  }

  last() {
    return this.nth(-1);
  }

  and(other: Locator): Locator {
    return this.step(`and(${other.description})`, (elements, root) => {
      const matching = new Set(root ? other.resolve(root) : other.all());
      return elements.filter((el) => matching.has(el));
    });
  }

  or(other: Locator): Locator {
    return this.step(`or(${other.description})`, (elements, root) =>
      docOrder([...elements, ...(root ? other.resolve(root) : other.all())]));
  }
}

function fmtMatch(m: TextMatch) {
  return m instanceof RegExp ? String(m) : JSON.stringify(m);
}

function fmtOpts(o: object) {
  const parts = Object.entries(o).map(([k, v]) => `${k}: ${v instanceof RegExp ? String(v) : v instanceof Locator ? v.description : JSON.stringify(v)}`);
  return `{ ${parts.join(', ')} }`;
}

/** The root `page` object. Its query is the document element. */
export function makePage(doc: Document): Locator {
  const query = () => [doc.documentElement];
  pageQueries.add(query);
  return new Locator(query, 'page');
}

/** Evaluates a user expression of any strategy against a document. */
export function resolveExpression(doc: Document, expr: string, strategy: Strategy = detectStrategy(expr)): Element[] {
  const s = expr.trim().replace(/;$/, '');
  if (!s) throw new LocatorError('Type a locator first.');
  if (strategy === 'css') return cssWithin(doc.documentElement, s, true);
  if (strategy === 'xpath') return xpathWithin(doc, s.replace(/^xpath=/, ''));
  const page = makePage(doc);
  let result: unknown;
  try {
    const src = s.startsWith('page') ? s : `page.${s}`;
    result = new Function('page', `"use strict"; return (${src});`)(page);
  } catch (e) {
    if (e instanceof LocatorError) throw e;
    throw new LocatorError(e instanceof Error ? e.message : String(e));
  }
  if (!(result instanceof Locator)) throw new LocatorError('That expression does not return a locator. Start with page.getBy... or page.locator(...)');
  return result.all();
}

/* ---------------- robustness review ---------------- */

export interface Smell {
  rule: string;
  detail: string;
}

const GENERATED_CLASS = /\.(css-[\w-]+|sc-[\w-]+|jsx-\d+|[a-z]+_[a-z0-9]{5,}|[a-zA-Z]+-[a-f0-9]{5,}\b)/;
const GENERATED_ID = /#[\w-]*\d{3,}[\w-]*|#[\w-]*[a-f0-9]{8,}|\[id=['"]?[\w-]*\d{3,}/;

/** Flags locators that work today but will break with harmless page changes. */
export function reviewLocator(expr: string, strategy: Strategy = detectStrategy(expr)): Smell[] {
  const s = expr.trim();
  const out: Smell[] = [];
  const cssPart = strategy === 'css' ? s : (s.match(/locator\((['"`])(.*?)\1/)?.[2] ?? '');
  if (cssPart && !/^(\/|\(|xpath=)/.test(cssPart)) {
    if (/:nth-(child|of-type)|:first-child|:last-child|:eq\(/.test(cssPart)) out.push({ rule: 'Position-based', detail: 'Breaks when an element is added or reordered.' });
    if ((cssPart.match(/>/g) ?? []).length >= 3) out.push({ rule: 'Deep structural chain', detail: 'Ties the locator to the page layout.' });
    if (GENERATED_CLASS.test(cssPart)) out.push({ rule: 'Generated class name', detail: 'Build tools regenerate these on each release.' });
    if (GENERATED_ID.test(cssPart)) out.push({ rule: 'Generated id', detail: 'Looks auto-generated and likely to change between sessions.' });
    if (/(^|[\s>])(div|span)(\s*>\s*(div|span)){2,}/.test(cssPart)) out.push({ rule: 'Anonymous wrappers', detail: 'Chains of div/span carry no meaning and change often.' });
  }
  const xPart = strategy === 'xpath' ? s : (s.match(/locator\((['"`])((?:xpath=)?[/(].*?)\1/)?.[2] ?? '');
  if (xPart) {
    const x = xPart.replace(/^xpath=/, '');
    if (/^\/(?!\/)/.test(x) || /^\/html/.test(x)) out.push({ rule: 'Absolute XPath', detail: 'Starts at the root, so any layout change breaks it.' });
    if (/\[\d+\]/.test(x)) out.push({ rule: 'Index-based', detail: 'Depends on element order.' });
    if (GENERATED_ID.test(x.replace(/@id=/g, '[id='))) out.push({ rule: 'Generated id', detail: 'Looks auto-generated and likely to change.' });
    if (/(\/div){3,}|(\/span){3,}/.test(x)) out.push({ rule: 'Anonymous wrappers', detail: 'Long div chains change often.' });
  }
  if (strategy === 'playwright' && /\.(nth\(|first\(\)|last\(\))/.test(s)) {
    out.push({ rule: 'Position-based', detail: 'nth/first/last picks by order. Prefer a filter that names the item.' });
  }
  return out;
}
