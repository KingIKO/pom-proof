/// <reference lib="webworker" />
import { transform } from 'sucrase';
import { runCodingJs, runMutation, runSuite } from './core';

export type JsJob =
  | { id: number; type: 'coding'; code: string; ts: boolean; fn: string; cases: { args: unknown[]; expected: unknown; hidden?: boolean }[]; compare?: 'exact' | 'unordered' }
  | { id: number; type: 'mutation'; subject: 'function' | 'api'; implementation: string; mutants: { id: string; code: string }[]; tests: string; ts: boolean }
  | { id: number; type: 'suite'; subject: 'function' | 'api'; implementation: string; tests: string; ts: boolean };

function strip(code: string, ts: boolean) {
  if (!ts) return code;
  return transform(code, { transforms: ['typescript'], disableESTransforms: true }).code;
}

self.onmessage = async (e: MessageEvent<JsJob>) => {
  const job = e.data;
  try {
    if (job.type === 'coding') {
      const out = await runCodingJs(strip(job.code, job.ts), job.fn, job.cases, job.compare);
      self.postMessage({ id: job.id, ok: true, result: out });
    } else if (job.type === 'mutation') {
      const out = await runMutation(job.subject, job.implementation, job.mutants, strip(job.tests, job.ts));
      self.postMessage({ id: job.id, ok: true, result: out });
    } else {
      const out = await runSuite(job.subject, job.implementation, strip(job.tests, job.ts));
      self.postMessage({ id: job.id, ok: true, result: out });
    }
  } catch (err) {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    self.postMessage({ id: job.id, ok: false, error: msg });
  }
};
