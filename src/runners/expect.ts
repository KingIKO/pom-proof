/**
 * A small Jest/Playwright-flavoured assertion library and test collector.
 * Pure JS with no DOM access, so it runs in a worker, in Node (content
 * validation) and on the page (UI lab). The UI lab adds locator matchers on top.
 */

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

export function fmt(v: unknown): string {
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'function') return '[Function]';
  if (v instanceof Error) return `${v.name}: ${v.message}`;
  if (v === undefined) return 'undefined';
  if (typeof v === 'number' && !Number.isFinite(v)) return String(v);
  try {
    const s = JSON.stringify(v, (_k, val) => (val === undefined ? '__undefined__' : val));
    return (s ?? String(v)).replace(/"__undefined__"/g, 'undefined');
  } catch {
    return String(v);
  }
}

export function deepEqual(a: unknown, b: unknown, strict = false): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a === 'number' && typeof b === 'number') return a === b;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [k, v] of a) if (!b.has(k) || !deepEqual(v, b.get(k), strict)) return false;
    return true;
  }
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }
  const ka = Object.keys(a as object).filter((k) => strict || (a as Record<string, unknown>)[k] !== undefined);
  const kb = Object.keys(b as object).filter((k) => strict || (b as Record<string, unknown>)[k] !== undefined);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], strict)) return false;
  }
  return true;
}

function getPath(obj: unknown, path: string | string[]): { found: boolean; value: unknown } {
  const parts = Array.isArray(path) ? path : path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur === null || cur === undefined || !Object.prototype.hasOwnProperty.call(Object(cur), p)) return { found: false, value: undefined };
    cur = (cur as Record<string, unknown>)[p];
  }
  return { found: true, value: cur };
}

type Matcher = (...args: never[]) => unknown;

export function makeExpect() {
  function expect(actual: unknown) {
    const build = (negate: boolean) => {
      const check = (pass: boolean, msg: string, negMsg: string) => {
        if (pass === negate) throw new AssertionError(negate ? negMsg : msg);
      };
      const m: Record<string, Matcher> = {
        toBe: (expected: unknown) =>
          check(Object.is(actual, expected), `Expected ${fmt(actual)} to be ${fmt(expected)}`, `Expected ${fmt(actual)} not to be ${fmt(expected)}`),
        toEqual: (expected: unknown) =>
          check(deepEqual(actual, expected), `Expected ${fmt(actual)} to equal ${fmt(expected)}`, `Expected ${fmt(actual)} not to equal ${fmt(expected)}`),
        toStrictEqual: (expected: unknown) =>
          check(deepEqual(actual, expected, true), `Expected ${fmt(actual)} to strictly equal ${fmt(expected)}`, `Expected values not to be strictly equal`),
        toBeTruthy: () => check(!!actual, `Expected ${fmt(actual)} to be truthy`, `Expected ${fmt(actual)} to be falsy`),
        toBeFalsy: () => check(!actual, `Expected ${fmt(actual)} to be falsy`, `Expected ${fmt(actual)} to be truthy`),
        toBeNull: () => check(actual === null, `Expected ${fmt(actual)} to be null`, `Expected value not to be null`),
        toBeUndefined: () => check(actual === undefined, `Expected ${fmt(actual)} to be undefined`, `Expected value not to be undefined`),
        toBeDefined: () => check(actual !== undefined, `Expected value to be defined`, `Expected ${fmt(actual)} to be undefined`),
        toBeNaN: () => check(Number.isNaN(actual), `Expected ${fmt(actual)} to be NaN`, `Expected value not to be NaN`),
        toBeGreaterThan: (n: number) => check((actual as number) > n, `Expected ${fmt(actual)} > ${n}`, `Expected ${fmt(actual)} not > ${n}`),
        toBeGreaterThanOrEqual: (n: number) => check((actual as number) >= n, `Expected ${fmt(actual)} >= ${n}`, `Expected ${fmt(actual)} not >= ${n}`),
        toBeLessThan: (n: number) => check((actual as number) < n, `Expected ${fmt(actual)} < ${n}`, `Expected ${fmt(actual)} not < ${n}`),
        toBeLessThanOrEqual: (n: number) => check((actual as number) <= n, `Expected ${fmt(actual)} <= ${n}`, `Expected ${fmt(actual)} not <= ${n}`),
        toBeCloseTo: (n: number, digits = 2) =>
          check(Math.abs((actual as number) - n) < Math.pow(10, -digits) / 2, `Expected ${fmt(actual)} to be close to ${n}`, `Expected ${fmt(actual)} not to be close to ${n}`),
        toContain: (item: unknown) => {
          const has = typeof actual === 'string' ? actual.includes(String(item)) : Array.isArray(actual) ? actual.includes(item) : false;
          check(has, `Expected ${fmt(actual)} to contain ${fmt(item)}`, `Expected ${fmt(actual)} not to contain ${fmt(item)}`);
        },
        toContainEqual: (item: unknown) => {
          const has = Array.isArray(actual) && actual.some((x) => deepEqual(x, item));
          check(has, `Expected ${fmt(actual)} to contain an item equal to ${fmt(item)}`, `Expected no item equal to ${fmt(item)}`);
        },
        toHaveLength: (n: number) => {
          const len = (actual as { length?: number } | null)?.length;
          check(len === n, `Expected length ${n}, got ${fmt(len)}`, `Expected length not to be ${n}`);
        },
        toHaveProperty: (path: string | string[], value?: unknown) => {
          const r = getPath(actual, path);
          const pass = r.found && (value === undefined || deepEqual(r.value, value));
          check(
            pass,
            value === undefined ? `Expected property ${fmt(path)} to exist on ${fmt(actual)}` : `Expected property ${fmt(path)} to be ${fmt(value)}, got ${fmt(r.value)}`,
            `Expected property ${fmt(path)} not to match`,
          );
        },
        toMatch: (re: RegExp | string) => {
          const pass = typeof actual === 'string' && (typeof re === 'string' ? actual.includes(re) : re.test(actual));
          check(pass, `Expected ${fmt(actual)} to match ${String(re)}`, `Expected ${fmt(actual)} not to match ${String(re)}`);
        },
        toMatchObject: (subset: Record<string, unknown>) => {
          const pass =
            typeof actual === 'object' && actual !== null && Object.entries(subset).every(([k, v]) => deepEqual((actual as Record<string, unknown>)[k], v));
          check(pass, `Expected ${fmt(actual)} to match object ${fmt(subset)}`, `Expected ${fmt(actual)} not to match object ${fmt(subset)}`);
        },
        toBeInstanceOf: (cls: new (...a: never[]) => unknown) =>
          check(actual instanceof cls, `Expected value to be an instance of ${cls.name}`, `Expected value not to be an instance of ${cls.name}`),
        toThrow: (expected?: string | RegExp) => {
          if (typeof actual !== 'function') throw new AssertionError('toThrow() needs a function: expect(() => fn()).toThrow()');
          let threw = false;
          let err: unknown;
          try {
            (actual as () => unknown)();
          } catch (e) {
            threw = true;
            err = e;
          }
          const msg = err instanceof Error ? err.message : String(err);
          const matches = !threw ? false : expected === undefined ? true : typeof expected === 'string' ? msg.includes(expected) : expected.test(msg);
          check(
            matches,
            threw ? `Expected error matching ${String(expected)}, got "${msg}"` : `Expected function to throw`,
            `Expected function not to throw, but it threw "${msg}"`,
          );
        },
      };
      return m;
    };
    const api = build(false) as Record<string, Matcher> & { not: Record<string, Matcher>; resolves: unknown; rejects: unknown };
    api.not = build(true);
    return api;
  }
  return expect;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  ms: number;
}

export interface Collector {
  test: (name: string, fn: (fixtures: never) => unknown) => void;
  tests: { name: string; fn: (fixtures: unknown) => unknown }[];
}

export function makeCollector(): Collector {
  const tests: Collector['tests'] = [];
  const test = (name: string, fn: (fixtures: never) => unknown) => {
    if (typeof name !== 'string' || typeof fn !== 'function') throw new Error('Use test("name", async () => { ... })');
    tests.push({ name, fn: fn as (f: unknown) => unknown });
  };
  return { test, tests };
}

export function errMessage(e: unknown): string {
  if (e instanceof Error) return e.name === 'AssertionError' || e.name === 'TimeoutError' ? e.message : `${e.name}: ${e.message}`;
  return String(e);
}
