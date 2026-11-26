import { afterEach, describe, expect, it, vi } from 'vitest';
import { problemSchema } from '../../src/lib/problem-schema';
import { JS_WORKER_TIMEOUT_MS, runWorker } from '../../src/lib/run-worker';
import { url } from '../../src/lib/url';

const structured = {
  title: 'Select a release check',
  kind: 'scenario',
  topic: 'release-risk',
  difficulty: 'easy',
  minutes: 2,
  roles: ['manual-qa'],
  items: [{
    id: 'smoke',
    type: 'budgeted-pick',
    prompt: 'Spend up to three minutes.',
    choices: [
      { id: 'checkout', text: 'Check checkout', cost: 2 },
      { id: 'catalog', text: 'Check catalog', cost: 2 },
    ],
    budget: 3,
  }],
  reference: { smoke: ['checkout'] },
  decoy: { smoke: ['catalog'] },
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('problem schema', () => {
  it('accepts a valid sample', () => {
    expect(problemSchema.safeParse(structured).success).toBe(true);
  });

  it.each([
    { kind: 'unknown' },
    { reference: { smoke: ['checkout', 'catalog'] } },
    { reference: { smoke: ['missing'] } },
    { reference: { smoke: ['checkout', 'checkout'] } },
    { reference: { smoke: 'checkout' } },
    { reference: { smoke: ['checkout'], typo: 'catalog' } },
    { decoy: structured.reference },
  ])('rejects invalid frontmatter: %j', (override) => {
    expect(problemSchema.safeParse({ ...structured, ...override }).success).toBe(false);
  });
});

describe('site paths', () => {
  it.each(['/pom-proof', '/pom-proof/'])('prefixes site paths exactly once with base %s', (base) => {
    vi.stubEnv('BASE_URL', base);
    expect(url()).toBe('/pom-proof/');
    expect(url('/tracks/')).toBe('/pom-proof/tracks/');
    expect(url('#main')).toBe('#main');
  });
});

describe('worker lifecycle', () => {
  class TestWorker extends EventTarget {
    postMessage = vi.fn();
    terminate = vi.fn();
  }

  it('terminates the worker immediately after a result', async () => {
    const worker = new TestWorker();
    const result = runWorker(worker as unknown as Worker, [1, 1], Number, JS_WORKER_TIMEOUT_MS);
    worker.dispatchEvent(new MessageEvent('message', { data: 2 }));
    expect(await result).toBe(2);
    expect(worker.postMessage).toHaveBeenCalledWith([1, 1]);
    expect(worker.terminate).toHaveBeenCalledExactlyOnceWith();
  });

  it('terminates a non-responding JS worker at two seconds', async () => {
    vi.useFakeTimers();
    const worker = new TestWorker();
    const result = runWorker(worker as unknown as Worker, [], Number, JS_WORKER_TIMEOUT_MS);
    const rejection = expect(result).rejects.toThrow('The worker timed out');
    await vi.advanceTimersByTimeAsync(1999);
    expect(worker.terminate).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await rejection;
    expect(worker.terminate).toHaveBeenCalledExactlyOnceWith();
  });
});
