import { runWorker } from '../lib/run-worker';
import { SQL_WORKER_TIMEOUT_MS, SqlTimeoutError, type SqlRunner, type SqlWorkerRequest, type SqlWorkerValue } from './sql';

function waitForSqlite(worker: Worker): Promise<void> {
  return new Promise((resolve, reject) => {
    const listeners = new AbortController();
    const options = { signal: listeners.signal };
    const fail = (message: string) => {
      listeners.abort();
      worker.terminate();
      reject(new Error(message));
    };
    worker.addEventListener('message', ({ data }: MessageEvent<unknown>) => {
      if (data && typeof data === 'object' && 'ready' in data && data.ready === true) {
        listeners.abort();
        resolve();
      } else if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
        fail(data.error);
      } else {
        fail('Unable to start SQLite.');
      }
    }, options);
    worker.addEventListener('error', (event) => {
      event.preventDefault();
      fail(event.message || 'Unable to start SQLite.');
    }, options);
    worker.addEventListener('messageerror', () => fail('Unable to start SQLite.'), options);
  });
}

async function runSql<M extends keyof SqlRunner>(request: SqlWorkerRequest<M>): Promise<SqlWorkerValue<M>> {
  const worker = new Worker(new URL('./sql.worker.ts', import.meta.url), { type: 'module' });
  await waitForSqlite(worker);
  try {
    return await runWorker(worker, request, (reply) => {
      if (reply && typeof reply === 'object') {
        if ('error' in reply && typeof reply.error === 'string') throw new Error(reply.error);
        if ('method' in reply && reply.method === request.method && 'value' in reply) {
          return reply.value as SqlWorkerValue<M>;
        }
      }
      throw new Error('Unable to read the SQL result.');
    }, SQL_WORKER_TIMEOUT_MS);
  } catch (error) {
    if (error instanceof Error && error.message === 'The worker timed out') throw new SqlTimeoutError();
    throw error;
  }
}

export const sqlRunner: SqlRunner = {
  query: (...args) => runSql<'query'>({ method: 'query', args }),
  compare: (...args) => runSql<'compare'>({ method: 'compare', args }),
  schema: (...args) => runSql<'schema'>({ method: 'schema', args }),
};
