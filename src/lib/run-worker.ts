export const JS_WORKER_TIMEOUT_MS = 2_000;
export const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v314.0.8/full/';

export function runWorker<Input, Output>(
  worker: Worker,
  input: Input,
  decode: (value: unknown) => Output,
  timeoutMs: number,
): Promise<Output> {
  return new Promise((resolve, reject) => {
    const dispose = () => {
      clearTimeout(timer);
      worker.terminate();
    };
    const fail = (error: unknown) => {
      dispose();
      reject(error);
    };
    const timer = setTimeout(() => fail(new Error('The worker timed out')), timeoutMs);

    worker.addEventListener('error', (event) => {
      event.preventDefault();
      fail(new Error(event.message || 'The worker failed'));
    }, { once: true });
    worker.addEventListener('messageerror', () => fail(new Error('Unable to read the worker reply')), { once: true });
    worker.addEventListener('message', (event: MessageEvent<unknown>) => {
      try {
        const value = decode(event.data);
        dispose();
        resolve(value);
      } catch (error) {
        fail(error);
      }
    }, { once: true });
    try {
      worker.postMessage(input);
    } catch (error) {
      fail(error);
    }
  });
}
