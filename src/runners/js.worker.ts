import { evaluateCode, type CodeRequest } from './code-evaluate';

const reply = self.postMessage.bind(self);

// These shadows block direct calls to common network and worker APIs. Same-origin
// workers and dynamic evaluation are not a security boundary. Run only code you trust.
for (const name of [
  'fetch', 'XMLHttpRequest', 'WebSocket', 'importScripts', 'EventSource', 'WebTransport',
  'Worker', 'SharedWorker', 'postMessage', 'close',
]) {
  Object.defineProperty(self, name, { value: undefined, configurable: false, writable: false });
}

self.addEventListener('message', async ({ data }: MessageEvent<CodeRequest>) => {
  reply(await evaluateCode(data));
}, { once: true });
