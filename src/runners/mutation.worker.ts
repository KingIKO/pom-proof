import { gradeSuite, type MutationRequest } from '../engines/mutation/suite';

const reply = self.postMessage.bind(self);
for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'importScripts', 'EventSource', 'postMessage']) {
  Object.defineProperty(self, name, { value: undefined });
}

async function load(source: string, name: string) {
  const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  try {
    const module: Record<string, unknown> = await import(/* @vite-ignore */ url);
    const fn = module[name];
    if (typeof fn !== 'function') throw new Error(`Export a function named ${name}`);
    return fn as (...args: unknown[]) => unknown;
  } finally {
    URL.revokeObjectURL(url);
  }
}

self.addEventListener('message', async (event: MessageEvent<MutationRequest>) => {
  reply(await gradeSuite(event.data, load));
}, { once: true });
