import type { JsJob } from './js.worker';
import type { CaseResult, MutationReport, SuiteRun } from './core';
import { compareValues } from './core';
import { fmt } from './expect';

/*
  Main-thread side of the workers. Each job gets a time limit; a runaway loop
  is stopped by terminating the worker, and a fresh one starts on the next job.
*/

const JS_TIMEOUT_MS = 8000;
/** First Python run downloads about 6 MB, so it gets a load budget on top of the run budget. */
const PY_RUN_MS = 10000;
const PY_LOAD_MS = 90000;

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void; timer: number };

class WorkerPool {
  private worker: Worker | null = null;
  private seq = 0;
  private pending = new Map<number, Pending>();
  private make: () => Worker;
  private onStatus?: (id: number, status: string) => void;

  constructor(make: () => Worker) {
    this.make = make;
  }

  setStatusHandler(fn: (id: number, status: string) => void) {
    this.onStatus = fn;
  }

  private get() {
    if (!this.worker) {
      this.worker = this.make();
      this.worker.onmessage = (e: MessageEvent<{ id: number; ok?: boolean; result?: unknown; error?: string; status?: string }>) => {
        const { id, ok, result, error, status } = e.data;
        if (status) {
          this.onStatus?.(id, status);
          return;
        }
        const p = this.pending.get(id);
        if (!p) return;
        window.clearTimeout(p.timer);
        this.pending.delete(id);
        if (ok) p.resolve(result);
        else p.reject(new Error(error ?? 'Runner failed'));
      };
      this.worker.onerror = (e) => {
        for (const [, p] of this.pending) {
          window.clearTimeout(p.timer);
          p.reject(new Error(e.message || 'Runner crashed'));
        }
        this.pending.clear();
        this.kill();
      };
    }
    return this.worker;
  }

  kill() {
    this.worker?.terminate();
    this.worker = null;
  }

  run<T>(job: Record<string, unknown>, timeoutMs: number): Promise<T> {
    const id = ++this.seq;
    const w = this.get();
    return new Promise<T>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        this.pending.delete(id);
        this.kill();
        reject(new Error(`Stopped after ${Math.round(timeoutMs / 1000)} s. Look for an infinite loop or a promise that never settles.`));
      }, timeoutMs);
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject, timer });
      w.postMessage({ ...job, id });
    });
  }
}

const jsPool = new WorkerPool(() => new Worker(new URL('./js.worker.ts', import.meta.url), { type: 'module' }));
const pyPool = new WorkerPool(() => new Worker(new URL('./py.worker.ts', import.meta.url), { type: 'module' }));

type Omit2<T> = T extends unknown ? Omit<T, 'id'> : never;

function runJs<T>(job: Omit2<JsJob>) {
  return jsPool.run<T>(job as Record<string, unknown>, JS_TIMEOUT_MS);
}

export function runCoding(job: Omit2<Extract<JsJob, { type: 'coding' }>>) {
  return runJs<{ results: CaseResult[]; compileError?: string }>(job);
}

export function runMutationJob(job: Omit2<Extract<JsJob, { type: 'mutation' }>>) {
  return runJs<MutationReport>(job);
}

export function runSuiteJob(job: Omit2<Extract<JsJob, { type: 'suite' }>>) {
  return runJs<SuiteRun>(job);
}

let pyLoaded = false;
export function pythonLoaded() {
  return pyLoaded;
}

export async function runPython(
  code: string,
  fn: string,
  cases: { args: unknown[]; expected: unknown; hidden?: boolean }[],
  compare: 'exact' | 'unordered' = 'exact',
  onLoading?: () => void,
): Promise<{ results: CaseResult[]; compileError?: string }> {
  pyPool.setStatusHandler(() => {
    if (!pyLoaded) onLoading?.();
  });
  type PyRaw = { compileError?: string; results?: { ok: boolean; actual?: string; error?: string; logs: string }[] };
  let raw: PyRaw;
  try {
    raw = await pyPool.run<PyRaw>({ code, fn, cases }, pyLoaded ? PY_RUN_MS : PY_LOAD_MS + PY_RUN_MS);
  } catch (e) {
    // A timeout terminates the worker, so the next run downloads Pyodide again.
    pyLoaded = false;
    throw e;
  }
  pyLoaded = true;
  if (raw.compileError) return { results: [], compileError: raw.compileError };
  const results: CaseResult[] = (raw.results ?? []).map((r, i) => {
    const c = cases[i];
    const base = { index: i, args: c.args.map(fmt), expected: fmt(c.expected), hidden: !!c.hidden, logs: r.logs ? r.logs.trimEnd().split('\n') : [] };
    if (!r.ok) return { ...base, actual: '', passed: false, error: r.error };
    const actual = JSON.parse(r.actual ?? 'null');
    return { ...base, actual: fmt(actual), passed: compareValues(actual, c.expected, compare) };
  });
  return { results };
}

/** camelCase JS name to the snake_case name Python solutions use. */
export function pyName(fn: string) {
  return fn.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}
