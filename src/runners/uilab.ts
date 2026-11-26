import { javascriptLanguage } from '@codemirror/lang-javascript';
import type { UiLabItem } from '../content/types';
import { AssertionError, errMessage, fmt, makeCollector, makeExpect, type TestResult } from './expect';
import { accessibleName, isDisabled, Locator, LocatorError, makePage, type RoleOptions } from './locators';

const ACTION_TIMEOUT = 2_000;
const ASSERTION_TIMEOUT = 5_000;
const TEST_TIMEOUT = 8_000;
const POLL_DELAYS = [0, 20, 50, 100, 100, 500];
const LOOP_LIMIT = 100_000;
type Text = string | RegExp;
type TimeoutOptions = { timeout?: number };
type Filter = { hasText?: Text; hasNotText?: Text; has?: UiLocator; hasNot?: UiLocator; visible?: boolean };
type TextOptions = { exact?: boolean };
type FrameWindow = Window & typeof globalThis;
const unchecked = new WeakMap<AbortSignal, Set<string>>();

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

function visible(el: Element) {
  if (!el.isConnected) return false;
  if (el.ownerDocument.defaultView?.getComputedStyle(el).visibility !== 'visible') return false;
  const { width, height } = el.getBoundingClientRect();
  return width > 0 && height > 0;
}

function enabled(el: Element) {
  return !isDisabled(el) && !el.closest('[aria-disabled="true"], [inert]') && !el.matches(':disabled');
}

function describe(el: Element) {
  const name = accessibleName(el);
  return `<${el.localName}>${name ? ` ${fmt(name)}` : ''}`;
}

function receivesPointer(el: Element) {
  el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
  const { x, y, width, height } = el.getBoundingClientRect();
  const target = el.ownerDocument.elementFromPoint(x + width / 2, y + height / 2);
  return target !== null && el.contains(target);
}

function view(el: Element) {
  return el.ownerDocument.defaultView as FrameWindow;
}

function pause(ms: number, signal: AbortSignal) {
  signal.throwIfAborted();
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
}

async function poll<T>(peek: () => T | undefined, timeout: number, signal: AbortSignal, onTimeout: () => Error): Promise<T> {
  const end = performance.now() + timeout;
  for (let i = 0; ; i++) {
    signal.throwIfAborted();
    const result = peek();
    if (result !== undefined) return result;
    const remaining = end - performance.now();
    if (remaining <= 0) throw onTimeout();
    await pause(Math.min(POLL_DELAYS[Math.min(i, POLL_DELAYS.length - 1)], remaining), signal);
  }
}

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
const CHECKABLE = 'input[type=checkbox], input[type=radio], [role=checkbox], [role=radio], [role=switch]';

function matches(actual: string, expected: Text, mode: 'raw' | 'text' | 'contain' = 'raw') {
  if (expected instanceof RegExp) return new RegExp(expected).test(actual);
  if (mode === 'contain') return normalize(actual).includes(normalize(expected));
  return mode === 'text' ? normalize(actual) === normalize(expected) : actual === expected;
}

function checked(el: Element) {
  if (el instanceof view(el).HTMLInputElement) return el.indeterminate ? 'mixed' : el.checked;
  const value = el.getAttribute('aria-checked');
  return value === 'mixed' ? 'mixed' : value === 'true';
}

function control(el: Element) {
  const win = view(el);
  if (el instanceof win.HTMLInputElement || el instanceof win.HTMLTextAreaElement || el instanceof win.HTMLSelectElement) return el;
  return null;
}

function dispatchChange(el: Element) {
  const win = view(el);
  el.dispatchEvent(new win.Event('input', { bubbles: true, composed: true }));
  el.dispatchEvent(new win.Event('change', { bubbles: true }));
}

function dispatchPointer(el: Element, click: boolean) {
  const win = view(el);
  const { x, y, width, height } = el.getBoundingClientRect();
  const point = { clientX: x + width / 2, clientY: y + height / 2, view: win };
  const pointer = { ...point, pointerId: 1, pointerType: 'mouse', isPrimary: true, composed: true };
  for (const [action, bubbles] of [['over', true], ['enter', false], ['move', true]] as const) {
    el.dispatchEvent(new win.PointerEvent(`pointer${action}`, { ...pointer, bubbles }));
    el.dispatchEvent(new win.MouseEvent(`mouse${action}`, { ...point, bubbles }));
  }
  if (!click) return;
  const down = { bubbles: true, cancelable: true, buttons: 1 };
  const focus = el.dispatchEvent(new win.PointerEvent('pointerdown', { ...pointer, ...down }))
    && el.dispatchEvent(new win.MouseEvent('mousedown', { ...point, ...down }));
  if (focus && el instanceof win.HTMLElement) el.focus();
  el.dispatchEvent(new win.PointerEvent('pointerup', { ...pointer, bubbles: true, cancelable: true }));
  el.dispatchEvent(new win.MouseEvent('mouseup', { ...point, bubbles: true, cancelable: true }));
  if (el instanceof win.HTMLElement) el.click();
  else el.dispatchEvent(new win.MouseEvent('click', { ...point, bubbles: true, cancelable: true, composed: true }));
}

function submitOnEnter(el: Element) {
  if (el.matches('button, input[type=submit], input[type=button], input[type=image], input[type=reset]')) {
    (el as HTMLElement).click();
    return;
  }
  if (!(el instanceof view(el).HTMLInputElement) || !el.form) return;
  const implicitTypes = ['text', 'search', 'tel', 'url', 'email', 'password', 'date', 'month', 'week', 'time', 'datetime-local', 'number'];
  if (!implicitTypes.includes(el.type)) return;
  const form = el.form;
  const inputs = Array.from(el.ownerDocument.querySelectorAll<HTMLInputElement | HTMLButtonElement>('button, input'))
    .filter((entry) => entry.form === form);
  const submitter = inputs.find((entry) => entry.type === 'submit' || entry.type === 'image');
  if (submitter) {
    if (enabled(submitter)) submitter.click();
  } else if (inputs.filter((entry) => entry.localName === 'input' && implicitTypes.includes(entry.type)).length === 1) {
    form.requestSubmit();
  }
}

export interface UiRunOptions { actionTimeout?: number; assertionTimeout?: number; testTimeout?: number }
type Readiness = 'attached' | 'visible' | 'enabled' | 'pointer' | 'editable';

export class UiLocator {
  constructor(private readonly source: Locator, readonly signal: AbortSignal, readonly options: UiRunOptions = {}) {}

  get description() { return this.source.description; }

  private wrap(source: Locator) { return new UiLocator(source, this.signal, this.options); }
  getByRole(role: string, options?: RoleOptions) { return this.wrap(this.source.getByRole(role, options)); }
  getByText(text: Text, options?: TextOptions) { return this.wrap(this.source.getByText(text, options)); }
  getByLabel(text: Text, options?: TextOptions) { return this.wrap(this.source.getByLabel(text, options)); }
  getByPlaceholder(text: Text, options?: TextOptions) { return this.wrap(this.source.getByPlaceholder(text, options)); }
  getByAltText(text: Text, options?: TextOptions) { return this.wrap(this.source.getByAltText(text, options)); }
  getByTitle(text: Text, options?: TextOptions) { return this.wrap(this.source.getByTitle(text, options)); }
  getByTestId(id: Text) { return this.wrap(this.source.getByTestId(id)); }
  locator(selector: string, options?: Pick<Filter, 'has' | 'hasText'>) {
    return this.wrap(this.source.locator(selector, { hasText: options?.hasText, has: options?.has?.source }));
  }
  filter({ has, hasNot, ...options }: Filter) {
    return this.wrap(this.source.filter({ ...options, ...(has && { has: has.source }), ...(hasNot && { hasNot: hasNot.source }) }));
  }
  nth(i: number) { return this.wrap(this.source.nth(i)); }
  first() { return this.wrap(this.source.first()); }
  last() { return this.wrap(this.source.last()); }
  and(other: UiLocator) { return this.wrap(this.source.and(other.source)); }
  or(other: UiLocator) { return this.wrap(this.source.or(other.source)); }

  single(): Element | undefined {
    this.signal.throwIfAborted();
    const found = this.source.all();
    if (found.length > 1) {
      throw new LocatorError(`strict mode violation: ${this.description} resolved to ${found.length} elements (${found.slice(0, 3).map(describe).join(', ')}). Narrow the locator.`);
    }
    return found[0];
  }

  matchCount() {
    this.signal.throwIfAborted();
    return this.source.count();
  }
  async count() { return this.matchCount(); }
  async all() { return Array.from({ length: this.matchCount() }, (_, index) => this.nth(index)); }
  async isVisible() {
    const el = this.single();
    return !!el && visible(el);
  }
  async isEnabled(options?: TimeoutOptions) { return enabled(await this.wait('isEnabled', options)); }
  async textContent(options?: TimeoutOptions) { return (await this.wait('textContent', options)).textContent; }
  async innerText(options?: TimeoutOptions) {
    const el = await this.wait('innerText', options);
    return el instanceof view(el).HTMLElement ? el.innerText : el.textContent ?? '';
  }
  async inputValue(options?: TimeoutOptions) {
    const el = await this.wait('inputValue', options);
    const input = control(el);
    if (!input) throw new LocatorError(`${this.description} must resolve to an input, textarea or select.`);
    return input.value;
  }

  private wait(action: string, options?: TimeoutOptions, readiness: Readiness = 'attached', ready?: (el: Element) => boolean) {
    const timeout = options?.timeout ?? this.options.actionTimeout ?? ACTION_TIMEOUT;
    return poll(() => {
      const el = this.single();
      if (!el) return;
      if (readiness !== 'attached' && !visible(el)) return;
      if (readiness !== 'attached' && readiness !== 'visible' && !enabled(el)) return;
      if ((readiness === 'pointer' || action === 'hover') && !receivesPointer(el)) return;
      if (readiness === 'editable' && (el.hasAttribute('readonly') || el.getAttribute('aria-readonly') === 'true')) return;
      return !ready || ready(el) ? el : undefined;
    }, timeout, this.signal, () => new TimeoutError(
      `${this.description}.${action}() timed out after ${timeout} ms waiting for one ${readiness === 'attached' ? 'attached' : 'actionable'} element.`,
    ));
  }

  async click(options?: TimeoutOptions) {
    dispatchPointer(await this.wait('click', options, 'pointer'), true);
  }
  async hover(options?: TimeoutOptions) {
    dispatchPointer(await this.wait('hover', options, 'visible'), false);
  }
  async fill(value: string, options?: TimeoutOptions) {
    const el = await this.wait('fill', options, 'editable');
    const win = view(el);
    if (el instanceof win.HTMLTextAreaElement || (el instanceof win.HTMLInputElement
      && ['text', 'email', 'password', 'search', 'tel', 'url', 'number', 'date', 'month', 'week', 'time', 'datetime-local', 'color', 'range'].includes(el.type))) {
      el.focus();
      el.value = value;
    } else if (el instanceof win.HTMLElement && el.isContentEditable) {
      el.focus();
      el.textContent = value;
    } else {
      throw new LocatorError(`${this.description} is not a fillable form control.`);
    }
    dispatchChange(el);
  }
  async press(key: string, options?: TimeoutOptions) {
    const el = await this.wait('press', options);
    const win = view(el);
    if (el instanceof win.HTMLElement) el.focus();
    const init = { key, bubbles: true, cancelable: true, composed: true };
    const down = el.dispatchEvent(new win.KeyboardEvent('keydown', init));
    const pressed = down && el.dispatchEvent(new win.KeyboardEvent('keypress', init));
    if (pressed && key === 'Enter') submitOnEnter(el);
    el.dispatchEvent(new win.KeyboardEvent('keyup', init));
  }
  private async setChecked(want: boolean, options?: TimeoutOptions) {
    const action = want ? 'check' : 'uncheck';
    const el = await this.wait(action, options, 'pointer');
    if (!el.matches(CHECKABLE)) {
      throw new LocatorError(`${this.description} is not a checkbox, radio button or switch.`);
    }
    if (checked(el) === want) return;
    if (!want && el.matches('input[type=radio], [role=radio]')) throw new LocatorError('Select another radio button to clear this one.');
    dispatchPointer(el, true);
    if (checked(el) !== want) throw new LocatorError(`${this.description} did not become ${want ? 'checked' : 'unchecked'}.`);
  }
  check(options?: TimeoutOptions) { return this.setChecked(true, options); }
  uncheck(options?: TimeoutOptions) { return this.setChecked(false, options); }
  async selectOption(choice: string | { value?: string; label?: string }, options?: TimeoutOptions) {
    const find = (target: HTMLSelectElement) => {
      const values = Array.from(target.options);
      if (typeof choice === 'string') return values.find((option) => option.value === choice) ?? values.find((option) => option.label === choice);
      return values.find((option) => (choice.value !== undefined || choice.label !== undefined)
        && (choice.value === undefined || option.value === choice.value) && (choice.label === undefined || option.label === choice.label));
    };
    const el = await this.wait('selectOption', options, 'enabled', (target) => {
      if (!(target instanceof view(target).HTMLSelectElement)) throw new LocatorError(`${this.description} is not a select.`);
      const option = find(target);
      return !!option && enabled(option);
    }) as HTMLSelectElement;
    el.selectedIndex = find(el)!.index;
    dispatchChange(el);
    return [el.value];
  }
}

export class UiPage extends UiLocator {
  waitForTimeout(ms: number) { return pause(ms, this.signal); }
}

const valueExpect = makeExpect();

function locatorExpect(locator: UiLocator, negate: boolean) {
  type Result = { pass: boolean; actual: unknown };
  type Match = (el: Element) => Result;
  const retry = (name: string, arg: unknown, read: () => Result | undefined, options?: TimeoutOptions): Promise<boolean> => {
    const timeout = options?.timeout ?? locator.options.assertionTimeout ?? ASSERTION_TIMEOUT;
    let actual: unknown = 'no matching element';
    const attempt = poll(() => {
      const result = read();
      actual = result ? result.actual : 'no matching element';
      return result && result.pass !== negate ? true : undefined;
    }, timeout, locator.signal, () => new AssertionError(
      `${locator.description}: expected ${negate ? 'not ' : ''}${name}${arg === undefined ? '' : ` ${arg instanceof RegExp ? String(arg) : fmt(arg)}`}; got ${fmt(actual)} after ${timeout} ms.`,
    ));
    const pending = unchecked.get(locator.signal);
    if (!pending) return attempt;
    let token = `${locator.description}: ${name}`;
    while (pending.has(token)) token += ' ';
    pending.add(token);
    void attempt.catch(() => {});
    const consumed = () => { pending.delete(token); return attempt; };
    return {
      then: (resolve, reject) => consumed().then(resolve, reject),
      catch: (reject) => consumed().catch(reject),
      finally: (done) => consumed().finally(done),
      [Symbol.toStringTag]: 'Promise',
    };
  };
  const one = (name: string, arg: unknown, match: Match, options?: TimeoutOptions) =>
    retry(name, arg, () => {
      const el = locator.single();
      return el ? match(el) : undefined;
    }, options);
  const visibility = (want: boolean, options?: TimeoutOptions) => retry(want ? 'to be visible' : 'to be hidden', undefined, () => {
    const el = locator.single();
    const shown = el ? visible(el) : false;
    return { pass: shown === want, actual: !el ? 'no matching element' : shown ? 'visible' : 'hidden' };
  }, options);
  const compare = (name: string, expected: Text, get: (el: Element) => string | null, options?: TimeoutOptions, mode?: Parameters<typeof matches>[2]) =>
    one(name, expected, (el) => {
      const actual = get(el);
      return { actual, pass: actual !== null && matches(actual, expected, mode) };
    }, options);
  return {
    toBeVisible: (options?: TimeoutOptions) => visibility(true, options),
    toBeHidden: (options?: TimeoutOptions) => visibility(false, options),
    toHaveText: (text: Text, options?: TimeoutOptions) => compare('to have text', text, (el) => el.textContent, options, 'text'),
    toContainText: (text: Text, options?: TimeoutOptions) => compare('to contain text', text, (el) => el.textContent, options, 'contain'),
    toHaveValue: (value: Text, options?: TimeoutOptions) => compare('to have value', value, (el) => control(el)?.value ?? null, options),
    toHaveCount: (count: number, options?: TimeoutOptions) => retry('to have count', count, () => {
      const actual = locator.matchCount();
      return { actual, pass: actual === count };
    }, options),
    toBeEnabled: (options?: TimeoutOptions) => one('to be enabled', undefined, (el) => ({ actual: enabled(el) ? 'enabled' : 'disabled', pass: enabled(el) }), options),
    toBeDisabled: (options?: TimeoutOptions) => one('to be disabled', undefined, (el) => ({ actual: enabled(el) ? 'enabled' : 'disabled', pass: !enabled(el) }), options),
    toBeChecked: (options?: TimeoutOptions) => one('to be checked', undefined, (el) => {
      if (!el.matches(CHECKABLE)) throw new LocatorError(`${locator.description} is not a checkbox, radio button or switch.`);
      const actual = checked(el);
      return { actual, pass: actual === true };
    }, options),
    toHaveAttribute: (name: string, value?: Text, options?: TimeoutOptions) =>
      value === undefined
        ? one('to have attribute', name, (el) => ({ actual: el.getAttribute(name), pass: el.hasAttribute(name) }), options)
        : compare(`to have attribute ${name} equal to`, value, (el) => el.getAttribute(name), options),
    toHaveClass: (value: Text, options?: TimeoutOptions) => compare('to have class', value, (el) => el.getAttribute('class') ?? '', options),
  };
}

function uiExpect(actual: unknown) {
  if (!(actual instanceof UiLocator)) return valueExpect(actual);
  return { ...locatorExpect(actual, false), not: locatorExpect(actual, true) };
}

export interface UiFrame { doc: Document; dispose: () => void }
export type UiFrameFactory = (srcdoc: string) => Promise<UiFrame>;
export interface UiSuiteRun { tests: TestResult[]; error?: string }
export interface UiMutationReport {
  real: UiSuiteRun;
  mutants: { id: string; killed: boolean; by: string[]; run: UiSuiteRun }[];
}

const APP_STYLE = `
  * { box-sizing: border-box; }
  :root { font: 14px/1.45 system-ui, sans-serif; color: #15171a; background: #fff; }
  body { margin: 0; padding: 16px; }
  main { max-width: 440px; margin: 0 auto; }
  h1 { font-size: 18px; margin: 0 0 12px; }
  p { margin: 8px 0; }
  form { display: grid; gap: 8px; }
  label { display: grid; gap: 4px; }
  input, button, select { font: inherit; color: inherit; border: 1px solid #d1d5db; border-radius: 7px; background: #fff; padding: 5px 9px; min-width: 0; }
  button { cursor: pointer; }
  button.primary { background: #15171a; border-color: #15171a; color: #fff; }
  button:disabled { opacity: .55; cursor: default; }
  :focus-visible { outline: 2px solid #4176e6; outline-offset: 2px; }
  [role="alert"] { color: #ad2020; }
`;

export function buildUiSrcdoc(item: UiLabItem, script = item.script) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><style>${APP_STYLE}${(item.css ?? '').replace(/<\/style/gi, '<\\/style')}</style></head><body>${item.html}<script>addEventListener('error', (event) => { document.documentElement.dataset.appError = event.message || 'Unknown app error'; });</script><script>${script.replace(/<\/script/gi, '<\\/script')}</script></body></html>`;
}

export const UI_APP_SANDBOX = 'allow-scripts allow-same-origin allow-forms';

export function loadUiFrame(srcdoc: string): Promise<UiFrame> {
  const frame = document.createElement('iframe');
  frame.className = 'ui-lab-fixture';
  frame.title = 'Test fixture';
  frame.tabIndex = -1;
  frame.setAttribute('aria-hidden', 'true');
  frame.setAttribute('sandbox', UI_APP_SANDBOX);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      frame.remove();
      reject(new TimeoutError('The test app did not load.'));
    }, TEST_TIMEOUT);
    frame.addEventListener('load', () => {
      clearTimeout(timer);
      const doc = frame.contentDocument;
      if (!doc || doc.URL !== 'about:srcdoc') {
        frame.remove();
        reject(new Error('The test app document is unavailable.'));
        return;
      }
      resolve({ doc, dispose: () => frame.remove() });
    }, { once: true });
    frame.srcdoc = srcdoc;
    document.body.append(frame);
  });
}

function instrumentLoops(js: string, guardName: string) {
  const edits = new Map<number, { opens: string; closes: string }>();
  const add = (pos: number, kind: 'opens' | 'closes', text: string) => {
    const edit = edits.get(pos) ?? { opens: '', closes: '' };
    edit[kind] += text;
    edits.set(pos, edit);
  };
  javascriptLanguage.parser.parse(js).iterate({
    enter(ref) {
      const node = ref.node;
      if (node.type.isError) throw new SyntaxError('Could not parse the tests. Check the test syntax.');
      if (!['ForStatement', 'WhileStatement', 'DoStatement'].includes(node.name)) return;
      let body = node.name === 'DoStatement' ? node.firstChild?.nextSibling : node.lastChild;
      while (body && (body.name === 'LineComment' || body.name === 'BlockComment')) {
        body = node.name === 'DoStatement' ? body.nextSibling : body.prevSibling;
      }
      if (!body) throw new SyntaxError('Each loop needs a body.');
      if (body.name === 'Block') {
        add(body.from + 1, 'opens', `${guardName}();`);
      } else {
        add(body.from, 'opens', `{${guardName}();`);
        add(body.to, 'closes', '}');
      }
    },
  });
  for (const [pos, { opens, closes }] of [...edits].sort(([a], [b]) => b - a)) {
    js = js.slice(0, pos) + closes + opens + js.slice(pos);
  }
  return js;
}

type Register = (test: ReturnType<typeof makeCollector>['test'], expect: typeof uiExpect, guard: () => void) => void;

async function compile(code: string): Promise<Register> {
  const { transform } = await import('sucrase');
  const js = transform(code, { transforms: ['typescript'], disableESTransforms: true }).code;
  let guardName = '__pomProofCheckLoop';
  while (js.includes(guardName)) guardName += '_';
  // Learner-authored code runs in this tab. The guard handles accidental loops,
  // not hostile code. The iframe only contains the bundled practice app.
  return new Function('test', 'expect', guardName, `"use strict";\n${instrumentLoops(js, guardName)}\n`) as Register;
}

function collect(register: Register, controller: AbortController, timeout: number) {
  const collector = makeCollector();
  const end = performance.now() + timeout;
  let loops = 0;
  register(collector.test, uiExpect, () => {
    controller.signal.throwIfAborted();
    if (++loops > LOOP_LIMIT || performance.now() >= end) {
      controller.abort(new TimeoutError('Loop limit reached. Check the test for an infinite loop.'));
      controller.signal.throwIfAborted();
    }
  });
  controller.signal.throwIfAborted();
  return collector.tests;
}

async function runVariant(item: UiLabItem, register: Register, script: string, frameFactory: UiFrameFactory, options: UiRunOptions): Promise<UiSuiteRun> {
  const tests: TestResult[] = [];
  const timeout = options.testTimeout ?? TEST_TIMEOUT;
  try {
    const names = collect(register, new AbortController(), timeout).map(({ name }) => name);
    if (!names.length) return { tests, error: 'No tests found. Add a test with test("name", async ({ page }) => { ... }).' };
    const srcdoc = buildUiSrcdoc(item, script);
    for (const [index, name] of names.entries()) {
      const frame = await frameFactory(srcdoc);
      const controller = new AbortController();
      const pending = new Set<string>();
      unchecked.set(controller.signal, pending);
      const start = performance.now();
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const root = frame.doc.documentElement;
        if (root.dataset.appError) return { tests, error: `Test app failed: ${root.dataset.appError}` };
        const registered = collect(register, controller, timeout)[index];
        if (registered?.name !== name) return { tests, error: 'Test names changed during setup. Register the same tests on each run.' };
        const error = new TimeoutError(`Test timed out after ${timeout} ms.`);
        const deadline = new Promise<never>((_, reject) => {
          timer = setTimeout(() => {
            reject(error);
            controller.abort(error);
          }, Math.max(0, timeout - (performance.now() - start)));
        });
        const page = new UiPage(makePage(frame.doc), controller.signal, options);
        await Promise.race([Promise.resolve().then(() => registered.fn({ page })), deadline]);
        controller.signal.throwIfAborted();
        if (performance.now() - start >= timeout) throw error;
        if (root.dataset.appError) return { tests, error: `Test app failed: ${root.dataset.appError}` };
        if (pending.size) throw new AssertionError(`Await each locator assertion. First ignored assertion: ${pending.values().next().value}`);
        tests.push({ name, passed: true, ms: Math.round(performance.now() - start) });
      } catch (e) {
        const appError = frame.doc.documentElement.dataset.appError;
        if (appError) return { tests, error: `Test app failed: ${appError}` };
        tests.push({ name, passed: false, error: errMessage(e), ms: Math.round(performance.now() - start) });
      } finally {
        clearTimeout(timer);
        unchecked.delete(controller.signal);
        controller.abort();
        frame.dispose();
      }
    }
    return { tests };
  } catch (e) {
    return { tests, error: errMessage(e) };
  }
}

export function uiSuitePassed(run: UiSuiteRun) {
  return !run.error && run.tests.length > 0 && run.tests.every((test) => test.passed);
}

export async function runUiSuite(item: UiLabItem, code: string, frameFactory: UiFrameFactory, options: UiRunOptions = {}): Promise<UiSuiteRun> {
  try {
    return await runVariant(item, await compile(code), item.script, frameFactory, options);
  } catch (e) {
    return { tests: [], error: errMessage(e) };
  }
}

export async function runUiMutation(item: UiLabItem, code: string, frameFactory: UiFrameFactory, options: UiRunOptions = {}): Promise<UiMutationReport> {
  let register: Register;
  try {
    register = await compile(code);
  } catch (e) {
    return { real: { tests: [], error: errMessage(e) }, mutants: [] };
  }
  const real = await runVariant(item, register, item.script, frameFactory, options);
  const mutants: UiMutationReport['mutants'] = [];
  if (uiSuitePassed(real)) {
    for (const mutant of item.mutants) {
      const run = await runVariant(item, register, mutant.script, frameFactory, options);
      const by = run.error ? [] : run.tests.filter((test) => !test.passed).map((test) => test.name);
      mutants.push({ id: mutant.id, killed: by.length > 0, by, run });
    }
  }
  return { real, mutants };
}
