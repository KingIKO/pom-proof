import { expect, test, type Page, type Response, type TestInfo } from '@playwright/test';
import { onePerKind } from '../support/problems';

// Heavy libraries, found by request URL or by a string their own code carries. Chunk names are not
// stable (CodeMirror has shipped inside a chunk named after another module), so bodies are read too.
// The code and SQL workspaces below are the positive controls for the CodeMirror and sql.js checks;
// python.spec.ts shows the same request observer sees Pyodide's jsDelivr requests after a Python run.
const heavy = [
  { name: 'CodeMirror', url: /codemirror/i, marker: 'cm-scroller' },
  { name: 'sql.js', url: /sql-wasm|sql\.worker/i, marker: 'sqlite3_open' },
  { name: 'Pyodide', url: /pyodide|python\.worker/i, marker: 'loadPyodide' },
] as const;

type Entry = { url: string; js: boolean; decoded: number; transferred: number; reported: boolean; body: Buffer | null };

const light = [
  { name: 'practice list', url: '' },
  { name: 'questions list', url: 'questions/' },
  { name: 'question page', url: 'questions/playwright/independent-checkout-contexts/' },
  { name: 'tracks list', url: 'tracks/' },
  { name: 'track page', url: 'tracks/automation/' },
  { name: 'progress', url: 'progress/' },
  { name: '404 page', url: 'this-page-does-not-exist/', status: 404 },
];

/** Loads a page, waits for hydration and a quiet network, and returns every response with its sizes. */
async function measure(page: Page, url: string, status = 200): Promise<Entry[]> {
  const responses: Response[] = [];
  page.context().on('response', (response) => responses.push(response));
  const response = await page.goto(url);
  expect(response?.status(), `/${url} status`).toBe(status);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await page.waitForLoadState('networkidle');
  return Promise.all(responses.filter((entry) => /^https?:/.test(entry.url())).map(async (entry) => {
    await entry.finished();
    const sizes = await entry.request().sizes();
    const js = /javascript/.test(entry.headers()['content-type'] ?? '') || /\.m?js$/.test(new URL(entry.url()).pathname);
    // Chromium keeps no body for worker scripts; fetch the same URL so the marker check still reads it.
    const body = js ? await entry.body().catch(async () => (await page.request.get(entry.url())).body()) : null;
    // Chromium also reports no transfer size for a worker script; such a request is listed, not counted as 0.
    const reported = sizes.responseBodySize > 0 || !body?.length;
    return { url: entry.url(), js, decoded: body?.length ?? 0, transferred: sizes.responseBodySize + sizes.responseHeadersSize, reported, body };
  }));
}

const found = (entries: Entry[]) => heavy.flatMap(({ name, url, marker }) =>
  entries.filter((entry) => url.test(entry.url) || entry.body?.includes(marker)).map((entry) => `${name}: ${entry.url}`));

const kB = (bytes: number) => (bytes / 1024).toFixed(1);

/** Records the page weight on the test, for the run output and results.json. */
function record(testInfo: TestInfo, name: string, entries: Entry[]) {
  const js = entries.filter((entry) => entry.js);
  const sum = (list: Entry[], key: 'decoded' | 'transferred') => list.reduce((total, entry) => total + entry[key], 0);
  const weight = {
    page: name,
    jsFiles: js.length,
    jsBytes: sum(js, 'decoded'),
    jsTransferred: sum(js, 'transferred'),
    requests: entries.length,
    totalTransferred: sum(entries, 'transferred'),
    transferNotReported: entries.filter(({ reported }) => !reported).map(({ url, decoded }) => `${new URL(url).pathname} (${kB(decoded)} kB decoded)`),
    heavy: found(entries),
  };
  testInfo.annotations.push({ type: 'page weight', description: JSON.stringify(weight) });
  console.log(`page weight: ${name}: ${weight.jsFiles} JS files, ${kB(weight.jsBytes)} kB JS (${kB(weight.jsTransferred)} kB transferred); `
    + `${weight.requests} requests, ${kB(weight.totalTransferred)} kB transferred in all`
    + (weight.transferNotReported.length ? `; transfer size not reported for ${weight.transferNotReported.join(', ')}` : ''));
  return weight;
}

for (const { name, url, status } of light) {
  test(`${name} loads no CodeMirror, sql.js or Pyodide bytes`, async ({ page }, testInfo) => {
    const entries = await measure(page, url, status);
    const weight = record(testInfo, name, entries);
    expect(entries.length, 'requests were recorded').toBeGreaterThan(0);
    expect(weight.heavy, 'heavy library requests').toEqual([]);
    if (url === 'questions/') {
      expect(entries.map(({ url }) => new URL(url).pathname).filter((path) =>
        /\/questions\/(?:fragments\/|search\.json)/.test(path)), 'requests before opening a card or entering a search').toEqual([]);
    }
  });
}

const expectedHeavy: Record<string, string[]> = { code: ['CodeMirror'], sql: ['CodeMirror', 'sql.js'] };

for (const problem of onePerKind()) {
  test(`${problem.kind} workspace weight is recorded`, async ({ page }, testInfo) => {
    const entries = await measure(page, problem.path);
    const weight = record(testInfo, `${problem.kind} workspace`, entries);
    expect(weight.jsFiles, 'the workspace loaded JavaScript').toBeGreaterThan(0);
    // Positive controls: the detectors see the libraries where the page needs them.
    for (const library of expectedHeavy[problem.kind] ?? []) {
      expect(weight.heavy.some((entry) => entry.startsWith(`${library}:`)), `${library} detected on the ${problem.kind} workspace`).toBe(true);
    }
  });
}
