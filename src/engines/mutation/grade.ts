import type { Grader } from '../../lib/contracts';
import { JS_WORKER_TIMEOUT_MS, runWorker } from '../../lib/run-worker';
import { invalid, type MutationRequest } from './suite';

export const grade: Grader<'test-design'> = async (problem, { value }) => {
  const { exportName, implementation, mutants, params } = problem;
  try {
    const worker = new Worker(new URL('../../runners/mutation.worker.ts', import.meta.url), { type: 'module' });
    const input: MutationRequest = { exportName, implementation, mutants, params, answer: value };
    return await runWorker(worker, input, (reply) => {
      if (!reply || typeof reply !== 'object' || !('kind' in reply) || reply.kind !== 'test-design'
        || !('status' in reply)) throw new Error('Unable to read the worker result');
      if (reply.status === 'invalid-answer' && 'message' in reply && typeof reply.message === 'string') {
        return invalid(reply.message);
      }
      if (reply.status !== 'graded' || !('score' in reply) || typeof reply.score !== 'number' || !('details' in reply)) {
        throw new Error('Unable to read the worker result');
      }
      return reply as Awaited<ReturnType<Grader<'test-design'>>>;
    }, JS_WORKER_TIMEOUT_MS);
  } catch (error) {
    return invalid(error instanceof Error ? error.message : 'Unable to run the checks');
  }
};
