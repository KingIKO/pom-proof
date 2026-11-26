import { makeExpect, makeCollector, deepEqual, errMessage, fmt, type TestResult } from './expect';

/* Environment-neutral runners shared by the browser worker and the Node content validator. */

export interface CaseResult {
  index: number;
  args: string[];
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
  hidden: boolean;
  logs: string[];
}

function sortKey(v: unknown) {
  return JSON.stringify(v);
}

export function compareValues(actual: unknown, expected: unknown, mode: 'exact' | 'unordered' = 'exact') {
  if (mode === 'unordered' && Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) return false;
    const a = [...actual].map(sortKey).sort();
    const b = [...expected].map(sortKey).sort();
    return a.every((x, i) => x === b[i]);
  }
  return deepEqual(actual, expected);
}

function clone<T>(v: T): T {
  return v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T);
}

/** Evaluates user JS that declares `fnName`, then runs each case. */
export async function runCodingJs(
  code: string,
  fnName: string,
  cases: { args: unknown[]; expected: unknown; hidden?: boolean }[],
  compare: 'exact' | 'unordered' = 'exact',
): Promise<{ results: CaseResult[]; compileError?: string }> {
  const logs: string[] = [];
  const consoleShim = {
    log: (...a: unknown[]) => logs.push(a.map((x) => (typeof x === 'string' ? x : fmt(x))).join(' ')),
  };
  let fn: (...a: unknown[]) => unknown;
  try {
    const factory = new Function('console', `"use strict";\n${code}\n;return typeof ${fnName} === 'function' ? ${fnName} : undefined;`);
    fn = factory({ ...consoleShim, error: consoleShim.log, warn: consoleShim.log, info: consoleShim.log });
    if (typeof fn !== 'function') return { results: [], compileError: `Could not find a function named ${fnName}. Keep the given function name.` };
  } catch (e) {
    return { results: [], compileError: errMessage(e) };
  }
  const results: CaseResult[] = [];
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    logs.length = 0;
    const base = { index: i, args: c.args.map(fmt), expected: fmt(c.expected), hidden: !!c.hidden };
    try {
      let actual = fn(...clone(c.args));
      if (actual instanceof Promise) actual = await actual;
      const passed = compareValues(actual, c.expected, compare);
      results.push({ ...base, actual: fmt(actual), passed, logs: [...logs] });
    } catch (e) {
      results.push({ ...base, actual: '', passed: false, error: errMessage(e), logs: [...logs] });
    }
  }
  return { results };
}

/* ---------- API fixture modelled on Playwright's APIRequestContext ---------- */

export interface ApiRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: unknown;
}

export interface ApiResponseInit {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}

type Handler = (req: ApiRequest) => ApiResponseInit | Promise<ApiResponseInit>;

function makeRequestFixture(handler: Handler) {
  const send = async (method: string, url: string, opts: { data?: unknown; params?: Record<string, string | number>; headers?: Record<string, string> } = {}) => {
    if (typeof url !== 'string') throw new Error(`request.${method.toLowerCase()}() needs a URL string`);
    const [path, qs] = url.split('?');
    const query: Record<string, string> = {};
    new URLSearchParams(qs ?? '').forEach((v, k) => (query[k] = v));
    for (const [k, v] of Object.entries(opts.params ?? {})) query[k] = String(v);
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(opts.headers ?? {})) headers[k.toLowerCase()] = v;
    const res = await handler({ method, path, query, headers, body: opts.data === undefined ? undefined : clone(opts.data) });
    const body = res.body === undefined ? undefined : clone(res.body);
    const resHeaders: Record<string, string> = { 'content-type': 'application/json', ...(res.headers ?? {}) };
    return {
      status: () => res.status,
      ok: () => res.status >= 200 && res.status < 300,
      json: async () => {
        if (body === undefined) throw new Error('Response has no JSON body');
        return clone(body);
      },
      text: async () => (body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body)),
      headers: () => ({ ...resHeaders }),
    };
  };
  return {
    get: (url: string, o?: Parameters<typeof send>[2]) => send('GET', url, o),
    post: (url: string, o?: Parameters<typeof send>[2]) => send('POST', url, o),
    put: (url: string, o?: Parameters<typeof send>[2]) => send('PUT', url, o),
    patch: (url: string, o?: Parameters<typeof send>[2]) => send('PATCH', url, o),
    delete: (url: string, o?: Parameters<typeof send>[2]) => send('DELETE', url, o),
  };
}

/* ---------- Mutation runner ---------- */

export interface SuiteRun {
  tests: TestResult[];
  error?: string;
}

const TEST_TIMEOUT_MS = 2000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      const e = new Error(`Test timed out after ${ms} ms`);
      e.name = 'TimeoutError';
      reject(e);
    }, ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

/**
 * Runs the user's tests against one implementation. For subject 'function'
 * the implementation's declarations are in scope. For 'api' each test gets a
 * fresh server through the { request } fixture.
 */
export async function runSuite(subject: 'function' | 'api', implementation: string, tests: string): Promise<SuiteRun> {
  const { test, tests: collected } = makeCollector();
  const expect = makeExpect();
  const noop = () => {};
  const quietConsole = { log: noop, error: noop, warn: noop, info: noop };
  let createServer: (() => Handler) | undefined;
  try {
    if (subject === 'api') {
      createServer = new Function('console', `"use strict";\n${implementation}\n;return createServer;`)(quietConsole);
      new Function('test', 'expect', 'console', `"use strict";\n${tests}`)(test, expect, quietConsole);
    } else {
      new Function('test', 'expect', 'console', `"use strict";\n${implementation}\n;\n{\n${tests}\n}`)(test, expect, quietConsole);
    }
  } catch (e) {
    return { tests: [], error: errMessage(e) };
  }
  if (collected.length === 0) return { tests: [], error: 'No tests found. Add at least one test("name", () => { ... }).' };
  const results: TestResult[] = [];
  for (const t of collected) {
    const start = Date.now();
    try {
      const fixtures = subject === 'api' && createServer ? { request: makeRequestFixture(createServer()) } : {};
      await withTimeout(Promise.resolve().then(() => t.fn(fixtures)), TEST_TIMEOUT_MS);
      results.push({ name: t.name, passed: true, ms: Date.now() - start });
    } catch (e) {
      results.push({ name: t.name, passed: false, error: errMessage(e), ms: Date.now() - start });
    }
  }
  return { tests: results };
}

export interface MutationReport {
  real: SuiteRun;
  mutants: { id: string; killed: boolean; by: string[]; error?: string }[];
}

export async function runMutation(
  subject: 'function' | 'api',
  implementation: string,
  mutants: { id: string; code: string }[],
  tests: string,
): Promise<MutationReport> {
  const real = await runSuite(subject, implementation, tests);
  const out: MutationReport['mutants'] = [];
  for (const m of mutants) {
    const run = await runSuite(subject, m.code, tests);
    const failed = run.tests.filter((t) => !t.passed).map((t) => t.name);
    out.push({ id: m.id, killed: !!run.error || failed.length > 0, by: failed, error: run.error });
  }
  return { real, mutants: out };
}
