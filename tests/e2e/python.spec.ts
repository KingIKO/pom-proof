import { expect, test, type Page } from '@playwright/test';
import { discoverProblems, type DiscoveredProblem } from '../support/problems';
import { openWorkspace, replaceEditor, resultPanel } from '../support/workspace';

type CodeProblem = DiscoveredProblem & { data: Extract<DiscoveredProblem['data'], { kind: 'code' }> };
const problems = discoverProblems();
const code = problems.find((problem): problem is CodeProblem => problem.kind === 'code');
const loadingLine = 'Loading Python, about 6 MB, first run only';
const fromJsDelivr = (url: string) => URL.canParse(url) && new URL(url).hostname === 'cdn.jsdelivr.net';

/** Same conversion the brief fixes for Python names: classifyRun becomes classify_run. */
const snakeCase = (name: string) => name.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

/**
 * Counts how often the loading line appears from now on. It shows only while Pyodide loads,
 * so a read after the run could not fail; the observer is armed before the click.
 */
async function watchLoadingLine(page: Page) {
  await page.evaluate((text) => {
    const state = { seen: 0, showing: false };
    (window as unknown as { __loadingLine: typeof state }).__loadingLine = state;
    const check = () => {
      const showing = Array.from(document.querySelectorAll('[role="status"]')).some((node) => node.textContent?.includes(text));
      if (showing && !state.showing) state.seen += 1;
      state.showing = showing;
    };
    new MutationObserver(check).observe(document.body, { childList: true, subtree: true, characterData: true });
    check();
  }, loadingLine);
  return () => page.evaluate(() => (window as unknown as { __loadingLine: { seen: number } }).__loadingLine.seen);
}

async function choosePython(page: Page) {
  const language = page.getByRole('combobox', { name: /^Language\b/ });
  await language.selectOption('python');
  await expect(language).toHaveValue('python');
}

const editor = (page: Page) => page.getByRole('textbox', { name: 'Solution code' });
const visiblePass = (page: Page) => page.getByRole('status').filter({ hasText: /^(\d+) of \1 visible checks passed$/ });

test('a code problem with a Python solution exists', () => {
  expect(code, 'a code problem under content/problems').toBeDefined();
  expect(code!.data.solutions?.python?.trim(), `${code!.id} has a Python solution`).toBeTruthy();
});

test('Python loads from jsDelivr only after the first Python run, and the solution scores 1', async ({ page, context }) => {
  // Two Pyodide budgets at most: 2A's runner allows 60 s for the first load (src/runners/python-browser.ts).
  test.setTimeout(120_000);
  const requests: string[] = [];
  context.on('request', (request) => requests.push(request.url()));

  await page.goto('');
  await expect(page.getByRole('table', { name: 'Practice problems' }).locator('tbody tr')).toHaveCount(problems.length);
  await page.waitForLoadState('networkidle');
  expect(requests.length, 'the list page made requests').toBeGreaterThan(0);
  expect(requests.filter(fromJsDelivr), 'jsDelivr requests on the list page').toEqual([]);

  await openWorkspace(page, code!);
  await choosePython(page);
  await page.waitForLoadState('networkidle');
  expect(requests.filter(fromJsDelivr), 'jsDelivr requests on a code page before a Python run').toEqual([]);

  const loadingShown = await watchLoadingLine(page);
  await replaceEditor(editor(page), code!.data.solutions!.python);
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(resultPanel(page, 'Pass')).toHaveText(`Pass: ${code!.data.vectors.length} of ${code!.data.vectors.length} checks passed`, { timeout: 70_000 });
  expect(await loadingShown(), 'the loading line showed during the first Python run').toBe(1);
  // Positive control for the two absence checks above: the observer does see Pyodide's requests.
  expect(requests.filter(fromJsDelivr).length, 'jsDelivr requests after the Python run').toBeGreaterThan(0);

  // A second run reuses the loaded runtime, so the loading line stays away.
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(visiblePass(page)).toBeVisible();
  expect(await loadingShown(), 'the loading line shows on the first run only').toBe(1);
});

test('a runaway Python loop stops at the time limit and the next run works', async ({ page }) => {
  // Two Pyodide loads (the stop discards the runtime) at up to 60 s each, per src/runners/python-browser.ts.
  test.setTimeout(150_000);
  await openWorkspace(page, code!);
  await choosePython(page);
  const loadingShown = await watchLoadingLine(page);

  await replaceEditor(editor(page), `def ${snakeCase(code!.data.exportName)}(*args):\n    while True:\n        pass\n`);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(resultPanel(page, 'Not graded')).toHaveText(/Stopped after 2 seconds\. Look for a loop that never ends\./, { timeout: 70_000 });
  await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeEnabled();

  await replaceEditor(editor(page), code!.data.solutions!.python);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(visiblePass(page)).toBeVisible({ timeout: 70_000 });
  expect(await loadingShown(), 'Python loaded again after the stopped run').toBe(2);
});
