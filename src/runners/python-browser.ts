import { JS_WORKER_TIMEOUT_MS } from '../lib/run-worker';
import type { CodeReply } from './code-evaluate';
import type { PythonCommand, PythonMessage, PythonRequest } from './python-contract';

const loadTimeoutMs = 60_000;
const loadError = 'Unable to load Python; check the connection and try again.';
const runTimeout = 'Stopped after 2 seconds. Look for a loop that never ends.';
let worker: Worker | undefined;
let queue = Promise.resolve();

function exchange(target: Worker, command: PythonCommand, timeoutMs: number, timeoutMessage: string) {
  return new Promise<PythonMessage>((resolve, reject) => {
    const listeners = new AbortController();
    const options = { signal: listeners.signal };
    const dispose = () => {
      clearTimeout(timer);
      listeners.abort();
    };
    const fail = (message: string) => {
      dispose();
      reject(new Error(message));
    };
    const timer = setTimeout(() => fail(timeoutMessage), timeoutMs);

    target.addEventListener('message', (event: MessageEvent<PythonMessage>) => {
      dispose();
      resolve(event.data);
    }, options);
    target.addEventListener('error', (event) => {
      event.preventDefault();
      fail(event.message || 'The Python worker failed.');
    }, options);
    target.addEventListener('messageerror', () => fail('Unable to read the Python checks.'), options);
    try {
      target.postMessage(command);
    } catch (error) {
      fail(String(error));
    }
  });
}

async function loadPython(onLoading?: (loading: boolean) => void): Promise<Worker> {
  onLoading?.(true);
  try {
    worker = new Worker(new URL('./python.worker.ts', import.meta.url), { type: 'module' });
    const reply = await exchange(worker, { type: 'load' }, loadTimeoutMs, loadError);
    if (reply?.type !== 'ready') throw new Error(loadError);
    return worker;
  } catch {
    throw new Error(loadError);
  } finally {
    onLoading?.(false);
  }
}

export function runPython(request: PythonRequest, onLoading?: (loading: boolean) => void): Promise<CodeReply> {
  const result = queue.then(async () => {
    try {
      const target = worker ?? await loadPython(onLoading);
      const message = await exchange(target, { type: 'run', request }, JS_WORKER_TIMEOUT_MS, runTimeout);
      if (message?.type === 'run-error') throw new Error(message.message);
      if (message?.type === 'result') {
        const reply = message.reply;
        if (reply && 'error' in reply && typeof reply.error === 'string') return reply;
        if (reply && 'checks' in reply && Array.isArray(reply.checks)
          && reply.checks.length === request.vectors.length
          && reply.checks.every((check, index) => check && typeof check.passed === 'boolean'
            && check.visible === request.vectors[index].visible && (!check.visible || Array.isArray(check.logs)))) {
          return reply;
        }
      }
      throw new Error('Unable to read the Python checks.');
    } catch (error) {
      worker?.terminate();
      worker = undefined;
      return { error: error instanceof Error ? error.message : String(error) };
    }
  });
  queue = result.then(() => undefined);
  return result;
}
