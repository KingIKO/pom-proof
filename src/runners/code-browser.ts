import { JS_WORKER_TIMEOUT_MS, runWorker } from '../lib/run-worker';
import type { CodeReply, CodeRunner } from './code-evaluate';

export const runCode: CodeRunner = async (request) => {
  try {
    const worker = new Worker(new URL('./js.worker.ts', import.meta.url), { type: 'module' });
    return await runWorker(worker, request, (value) => {
      const result = value as Partial<CodeReply> | null;
      if (result && 'error' in result && typeof result.error === 'string') return { error: result.error };
      if (result && 'checks' in result && Array.isArray(result.checks)
        && result.checks.length === request.vectors.length
        && result.checks.every((check, index) => check && typeof check.passed === 'boolean'
          && check.visible === request.vectors[index].visible && (!check.visible || Array.isArray(check.logs)))) {
        return { checks: result.checks };
      }
      throw new Error('Unable to read the code checks.');
    }, JS_WORKER_TIMEOUT_MS);
  } catch (error) {
    if (error instanceof Error && error.message === 'The worker timed out') {
      return { error: 'Stopped after 2 seconds. Look for a loop that never ends.' };
    }
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
