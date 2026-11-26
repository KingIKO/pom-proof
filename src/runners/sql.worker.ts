import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url&no-inline';
import { createSqlRunner, type SqlWorkerReply, type SqlWorkerRequest } from './sql';

const sqlite = initSqlJs({ locateFile: () => wasmUrl });
const runner = createSqlRunner(() => sqlite);
const errorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

void sqlite.then(
  () => self.postMessage({ ready: true }),
  (error) => self.postMessage({ error: errorMessage(error) }),
);

async function execute(request: SqlWorkerRequest): Promise<SqlWorkerReply> {
  switch (request.method) {
    case 'query': return { method: 'query', value: await runner.query(...request.args) };
    case 'compare': return { method: 'compare', value: await runner.compare(...request.args) };
    case 'schema': return { method: 'schema', value: await runner.schema(...request.args) };
  }
}

self.addEventListener('message', async ({ data }: MessageEvent<SqlWorkerRequest>) => {
  try {
    self.postMessage(await execute(data));
  } catch (error) {
    self.postMessage({ error: errorMessage(error) } satisfies SqlWorkerReply);
  }
}, { once: true });
