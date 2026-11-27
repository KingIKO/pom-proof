import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  decodePracticeContext, practiceContextEvent, practiceContextKey, practiceLabel, practiceListHref, practicePlace,
  practiceRowId, readPracticeContext, writePracticeContext, type PracticeContext,
} from '../../src/lib/practice-context';

// Expectations come from section 1 of .notes/practice-study-plan.md: the stored shape
// { v: 1, query, label, items }, the label rule, and the fallbacks (no storage or a malformed value
// leaves the page as built).
const none = { q: '', topic: [], kind: [], difficulty: [], role: [], status: [] };
const items: PracticeContext['items'] = [
  ['code/one', 'One'],
  ['sql/two', 'Two'],
  ['locator/three', 'Three'],
];
const context: PracticeContext = { v: 1, query: 'topic=playwright%2Capi', label: 'Playwright, API', items };

function memory(initial?: string) {
  const values = new Map<string, string>(initial === undefined ? [] : [[practiceContextKey, initial]]);
  return {
    values,
    getItem: (name: string) => values.get(name) ?? null,
    setItem: (name: string, value: string) => void values.set(name, value),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe('practiceLabel', () => {
  it('is empty with no filters', () => {
    expect(practiceLabel(none)).toBe('');
  });

  it('lists topics first, then kind, difficulty, role and status', () => {
    expect(practiceLabel({ ...none, kind: ['SQL'], topic: ['Playwright'] })).toBe('Playwright, SQL');
    expect(practiceLabel({ ...none, status: ['Solved'], difficulty: ['Easy'] })).toBe('Easy, Solved');
    expect(practiceLabel({ ...none, role: ['SDET'], topic: ['API'] })).toBe('API, SDET');
  });

  it('shows the first two values and counts the rest', () => {
    expect(practiceLabel({ ...none, topic: ['Playwright', 'API'], kind: ['Code'] })).toBe('Playwright, API and 1 more');
    expect(practiceLabel({ ...none, topic: ['Playwright', 'API', 'CI'], difficulty: ['Hard'] })).toBe('Playwright, API and 2 more');
  });

  it('reads a search alone as "Search: <text>" and counts it as one more value otherwise', () => {
    expect(practiceLabel({ ...none, q: '  login ' })).toBe('Search: login');
    expect(practiceLabel({ ...none, q: 'login', topic: ['Playwright'] })).toBe('Playwright, Search: login');
    expect(practiceLabel({ ...none, q: 'login', topic: ['Playwright', 'API'] })).toBe('Playwright, API and 1 more');
    expect(practiceLabel({ ...none, q: '   ' })).toBe('');
  });
});

describe('practicePlace', () => {
  it('gives the position and both neighbours in the middle of the list', () => {
    expect(practicePlace(context, 'sql/two')).toEqual({
      position: 2, total: 3, previous: { id: 'code/one', title: 'One' }, next: { id: 'locator/three', title: 'Three' },
    });
  });

  it('has no Previous on the first row and no Next on the last', () => {
    expect(practicePlace(context, 'code/one')).toMatchObject({ position: 1, previous: undefined, next: { id: 'sql/two' } });
    expect(practicePlace(context, 'locator/three')).toMatchObject({ position: 3, total: 3, previous: { id: 'sql/two' }, next: undefined });
  });

  it('is null for a problem outside the list or an empty list', () => {
    expect(practicePlace(context, 'code/missing')).toBeNull();
    expect(practicePlace({ ...context, items: [] }, 'code/one')).toBeNull();
  });

  it('has no neighbours when the list holds only this problem', () => {
    expect(practicePlace({ ...context, items: [items[0]] }, 'code/one')).toEqual({ position: 1, total: 1, previous: undefined, next: undefined });
  });
});

describe('stored context', () => {
  it('decodes a well-formed value', () => {
    expect(decodePracticeContext(JSON.stringify(context))).toEqual(context);
  });

  it.each([
    ['missing', null],
    ['empty', ''],
    ['not JSON', '{v:1'],
    ['null', 'null'],
    ['an array', '[]'],
    ['another version', JSON.stringify({ ...context, v: 2 })],
    ['a query that is not text', JSON.stringify({ ...context, query: 3 })],
    ['a label that is not text', JSON.stringify({ ...context, label: null })],
    ['items that are not a list', JSON.stringify({ ...context, items: {} })],
    ['an item without a title', JSON.stringify({ ...context, items: [['code/one']] })],
    ['an item with a bad id', JSON.stringify({ ...context, items: [['../../x', 'X']] })],
    ['an item id without a kind', JSON.stringify({ ...context, items: [['one', 'One']] })],
    ['a title that is not text', JSON.stringify({ ...context, items: [['code/one', 1]] })],
  ])('treats a value that is %s as no context', (_, raw) => {
    expect(decodePracticeContext(raw)).toBeNull();
  });

  it('re-encodes the stored query as a plain query string', () => {
    const odd = decodePracticeContext(JSON.stringify({ ...context, query: '?topic=a b&q=x#y' }));
    expect(odd?.query).toBe('topic=a+b&q=x%23y');
  });

  it('reads nothing when storage is missing or throws', () => {
    expect(readPracticeContext(null)).toBeNull();
    const blocked = { getItem: () => { throw new DOMException('blocked', 'SecurityError'); }, setItem: () => {} };
    expect(readPracticeContext(blocked)).toBeNull();
    expect(readPracticeContext(memory('not json'))).toBeNull();
    expect(readPracticeContext(memory(JSON.stringify(context)))).toEqual(context);
  });

  it('writes the value and fires the event, also when storage throws', () => {
    const events: unknown[] = [];
    const target = new EventTarget();
    target.addEventListener(practiceContextEvent, (event) => events.push((event as CustomEvent).detail));
    vi.stubGlobal('window', target);

    const store = memory();
    writePracticeContext({ query: context.query, label: context.label, items }, store);
    expect(JSON.parse(store.values.get(practiceContextKey)!)).toEqual(context);

    const blocked = { getItem: () => null, setItem: () => { throw new DOMException('full', 'QuotaExceededError'); } };
    expect(() => writePracticeContext({ query: '', label: '', items: [] }, blocked)).not.toThrow();
    expect(events).toEqual([context, { v: 1, query: '', label: '', items: [] }]);
  });
});

describe('links back to the list', () => {
  it('names each row by kind and slug', () => {
    expect(practiceRowId('test-design/boundary-values')).toBe('row-test-design-boundary-values');
  });

  it('carries the query and the row, and stays bare without them', () => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    expect(practiceListHref()).toBe(`${base}/`);
    expect(practiceListHref('topic=api')).toBe(`${base}/?topic=api`);
    expect(practiceListHref('', 'sql/two')).toBe(`${base}/#row-sql-two`);
    expect(practiceListHref('topic=api', 'sql/two')).toBe(`${base}/?topic=api#row-sql-two`);
  });
});
