import {
  getByLabelSelector, getByPlaceholderSelector, getByRoleSelector, getByTestIdSelector,
  getByTextSelector, Ivya,
} from 'ivya';
import type { Answer, Problem } from '../lib/contracts';

type Selector = { engine: 'css' | 'xpath' | 'ivya'; selector: string; warnings: string[] };
type LocatorValue = Answer<'locator'>['value'];
type LocatorSyntax = NonNullable<Problem<'locator'>['syntax']>;
type Value = string | number | boolean;
const testIdAttribute = 'data-testid';
const ivya = Ivya.create({ browser: 'chromium', testIdAttribute });
const positionWarning = 'This locator depends on position.';
const absoluteWarning = 'An absolute XPath depends on the full layout.';
const classWarning = 'A generated class name may change between builds.';
const selectorPrefix = /^(css|xpath)=/;
const playwrightExpression = /^page\s*\.\s*(?:[$\w]+\s*\(|$)/;

export const locatorSyntaxLabel = {
  css: 'a CSS locator',
  xpath: 'an XPath locator',
  playwright: 'a Playwright locator',
} satisfies Record<LocatorSyntax, string>;

function unquote(literal: string) {
  const escapes: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', '0': '\0' };
  return literal.slice(1, -1).replace(/\\(?:u[\da-f]{4}|x[\da-f]{2}|[^\r\n])/gi, (escape) => {
    if (escape.length > 2) return String.fromCharCode(Number.parseInt(escape.slice(2), 16));
    return escapes[escape[1]!] ?? escape[1]!;
  });
}

function expression(source: string): Selector {
  const token = /\s*(?:"(?:\\.|[^"\\\r\n])*"|'(?:\\.|[^'\\\r\n])*'|-?\d+|[$A-Z_a-z][\w$]*|[.(){},:;])/y;
  let offset = 0;
  function read(): string {
    if (!source.slice(offset).trim()) { offset = source.length; return ''; }
    token.lastIndex = offset;
    const match = token.exec(source);
    if (!match) throw new Error(`Unexpected character at position ${offset + 1}`);
    offset = token.lastIndex;
    return match[0].trimStart();
  }
  let next = read();
  function take() { const current = next; next = read(); return current; }
  function accept(expected: string) { if (next !== expected) return false; take(); return true; }
  function expect(expected: string) { if (!accept(expected)) throw new Error(`Expected ${expected}`); }
  function value(): Value {
    const part = take();
    if (part.startsWith("'") || part.startsWith('"')) return unquote(part);
    if (part === 'true' || part === 'false') return part === 'true';
    if (/^-?\d+$/.test(part) && Number.isSafeInteger(Number(part))) return Number(part);
    throw new Error('Use quoted strings, booleans, or whole numbers');
  }
  function text(): string {
    const part = value();
    if (typeof part !== 'string') throw new Error('Use a quoted string');
    return part;
  }
  function options(allowed: Record<string, 'string' | 'boolean'>) {
    const parsed: Record<string, Value> = Object.create(null);
    expect('{');
    while (!accept('}')) {
      const key = take();
      if (!Object.hasOwn(allowed, key) || Object.hasOwn(parsed, key)) throw new Error(`Unexpected option ${key || '(empty)'}`);
      expect(':');
      const option = value();
      if (typeof option !== allowed[key]) throw new Error(`${key} must be a ${allowed[key]}`);
      parsed[key] = option;
      if (!accept(',')) { expect('}'); break; }
    }
    return parsed;
  }

  expect('page');
  const parts: string[] = [];
  const warnings = new Set<string>();
  while (accept('.')) {
    const method = take();
    expect('(');
    switch (method) {
      case 'getByRole': {
        const role = text();
        if (!/^[a-z][a-z-]*$/.test(role)) throw new Error('Use a lowercase role name');
        const { name, exact } = accept(',') ? options({ name: 'string', exact: 'boolean' }) : {};
        parts.push(getByRoleSelector(role, { name: typeof name === 'string' ? name : undefined, exact: exact === true }));
        break;
      }
      case 'getByText':
      case 'getByLabel':
      case 'getByPlaceholder': {
        const matcher = text();
        const { exact } = accept(',') ? options({ exact: 'boolean' }) : {};
        const helper = { getByText: getByTextSelector, getByLabel: getByLabelSelector, getByPlaceholder: getByPlaceholderSelector }[method];
        parts.push(helper(matcher, { exact: exact === true }));
        break;
      }
      case 'getByTestId':
        parts.push(getByTestIdSelector(testIdAttribute, text()));
        break;
      case 'locator': {
        const raw = plainSelector(text());
        parts.push(`${raw.engine}=${raw.selector}`);
        raw.warnings.forEach((warning) => warnings.add(warning));
        break;
      }
      case 'filter': {
        if (!parts.length) throw new Error('Start with a locator before using filter');
        const { hasText } = options({ hasText: 'string' });
        if (typeof hasText !== 'string') throw new Error('Provide hasText for filter');
        parts.push(getByTextSelector(hasText, { exact: false }).replace(/^internal:text=/, 'internal:has-text='));
        break;
      }
      case 'nth': {
        if (!parts.length) throw new Error('Start with a locator before using nth');
        const index = value();
        if (typeof index !== 'number') throw new Error('Use a whole number for nth');
        parts.push(`nth=${index}`);
        warnings.add(positionWarning);
        break;
      }
      default:
        throw new Error(`Unsupported locator method ${method}`);
    }
    accept(',');
    expect(')');
  }
  accept(';');
  if (next || !parts.length) throw new Error('Enter a locator such as page.getByRole("button")');
  return { engine: 'ivya', selector: parts.join(' >> '), warnings: [...warnings] };
}

function selectorWarnings(engine: 'css' | 'xpath', selector: string) {
  const warnings: string[] = [];
  const syntax = selector.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '');
  if (engine === 'xpath') {
    if (/^\s*\(*\s*\/(?!\/)/.test(syntax)) warnings.push(absoluteWarning);
    if (/\[\s*(?:\d+|(?:last|position)\s*\([^)]*\)[^\]]*)\s*\]/i.test(syntax)) warnings.push(positionWarning);
  } else {
    if (/:(?:nth-(?:last-)?(?:child|of-type)|(?:first|last)-(?:child|of-type))\b/i.test(syntax)) warnings.push(positionWarning);
    if (/\.(?:(?:css|sc|jsx|emotion)-[\w-]+|[\w-]+__[a-z\d_-]{5,})(?![\w-])/i.test(syntax)) warnings.push(classWarning);
  }
  return warnings;
}

function plainSyntax(source: string): 'css' | 'xpath' {
  const prefix = selectorPrefix.exec(source);
  return prefix?.[1] === 'xpath' || (!prefix && /^(?:\(*\s*\/|\.\.?\/|[a-z-]+::)/i.test(source)) ? 'xpath' : 'css';
}

function plainSelector(source: string, engine?: 'css' | 'xpath'): Selector {
  const trimmed = source.trim();
  const prefix = selectorPrefix.exec(trimmed);
  const selector = prefix && (!engine || prefix[1] === engine) ? trimmed.slice(prefix[0].length).trim() : trimmed;
  const format = engine ?? plainSyntax(trimmed);
  if (!selector) throw new Error('Enter a locator');
  return { engine: format, selector, warnings: selectorWarnings(format, selector) };
}

function locatorSyntax(value: LocatorValue): LocatorSyntax {
  if (value.by === 'css' || value.by === 'xpath') return value.by;
  if (value.by !== 'expression') return 'playwright';
  const source = value.source.trim();
  if (!source) throw new Error('Enter a locator');
  return playwrightExpression.test(source) ? 'playwright' : plainSyntax(source);
}

export function compileLocator(value: LocatorValue, requiredSyntax?: LocatorSyntax): Selector {
  const syntax = locatorSyntax(value);
  if (requiredSyntax && syntax !== requiredSyntax) {
    throw new Error(`This problem asks for ${locatorSyntaxLabel[requiredSyntax]}.`);
  }
  switch (value.by) {
    case 'expression':
      return syntax === 'playwright' ? expression(value.source.trim()) : plainSelector(value.source, syntax);
    case 'css':
    case 'xpath':
      return plainSelector(value.selector, value.by);
    case 'role':
      return { engine: 'ivya', selector: getByRoleSelector(value.role, { name: value.name, exact: value.exact }), warnings: [] };
    case 'text':
      return { engine: 'ivya', selector: getByTextSelector(value.text, { exact: value.exact }), warnings: [] };
    case 'label':
      return { engine: 'ivya', selector: getByLabelSelector(value.text, { exact: value.exact }), warnings: [] };
    case 'test-id':
      return { engine: 'ivya', selector: getByTestIdSelector(testIdAttribute, value.testId), warnings: [] };
  }
}

export function resolveLocator(doc: Document, { engine, selector }: Selector): Element[] {
  if (engine === 'ivya') return ivya.queryLocatorSelectorAll(selector, doc);
  if (engine === 'css') return Array.from(doc.querySelectorAll(selector));
  const snapshot = doc.evaluate(selector, doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
  return Array.from({ length: snapshot.snapshotLength }, (_, index) => snapshot.snapshotItem(index))
    .filter((node): node is Element => node?.nodeType === Node.ELEMENT_NODE);
}
