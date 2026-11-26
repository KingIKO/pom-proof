import { expect, loadItem, openItem, setEditor, test, verdict } from './helpers';

const ID = 'failed-tests-from-log';
const TITLE = 'Failed tests from a run log';

test.describe('coding lab: failed-tests-from-log', () => {
  test('reference solution is accepted and the item is marked solved', async ({ page }) => {
    const ws = await openItem(page, ID, TITLE);
    const item = await loadItem(page, ID);
    const problem = page.getByRole('region', { name: 'Problem' });
    await expect(problem.getByTitle('Solved')).toHaveCount(0);

    await setEditor(page, ws, 'Solution code', item.reference.javascript);
    await ws.getByRole('button', { name: 'Submit' }).click();
    await expect(verdict(ws)).toContainText('Accepted');
    await expect(verdict(ws)).toContainText(`${item.cases.length} of ${item.cases.length} cases, including hidden`);
    await expect(problem.getByTitle('Solved')).toBeVisible();

    // Client-side navigation keeps the in-memory store, so the list shows the same status.
    await problem.getByRole('link', { name: 'Problems', exact: true }).click();
    const row = page.locator('table.table tbody tr').filter({ has: page.getByRole('link', { name: TITLE, exact: true }) });
    await expect(row.getByTitle('Solved')).toBeVisible();
  });

  test('a wrong solution shows Wrong answer and is not marked solved', async ({ page }) => {
    const ws = await openItem(page, ID, TITLE);
    await setEditor(page, ws, 'Solution code', 'function failedTests(log) {\n  return [];\n}');
    await ws.getByRole('button', { name: 'Submit' }).click();
    await expect(verdict(ws)).toContainText('Wrong answer');
    const problem = page.getByRole('region', { name: 'Problem' });
    await expect(problem.getByTitle('Attempted')).toBeVisible();
    await expect(problem.getByTitle('Solved')).toHaveCount(0);
  });

  test('a runaway loop is stopped and the page stays responsive', async ({ page }) => {
    const ws = await openItem(page, ID, TITLE);
    const problem = page.getByRole('region', { name: 'Problem' });
    await setEditor(page, ws, 'Solution code', 'function failedTests(log) {\n  while (true) {}\n}');
    await ws.getByRole('button', { name: 'Run', exact: true }).click();
    await expect(ws.getByText('Running…')).toBeVisible();

    // The loop runs in a worker, so the page still handles input while it spins.
    const hints = problem.getByRole('tab', { name: 'Hints' });
    await hints.click();
    await expect(hints).toHaveAttribute('aria-selected', 'true');
    await expect(ws.getByText('Running…')).toBeVisible();

    await expect(ws.getByRole('alert')).toContainText(/Stopped after \d+ s\. Look for an infinite loop/, { timeout: 20_000 });
    await expect(ws.getByRole('button', { name: 'Submit' })).toBeEnabled();

    // A fresh worker takes the next job.
    const item = await loadItem(page, ID);
    await setEditor(page, ws, 'Solution code', item.reference.javascript);
    await ws.getByRole('button', { name: 'Submit' }).click();
    await expect(verdict(ws)).toContainText('Accepted');
  });

  test('Python reference is accepted (downloads Pyodide; set E2E_PYTHON=1)', async ({ page }) => {
    test.skip(!process.env.E2E_PYTHON, 'Python e2e is opt-in: it downloads Pyodide from the CDN. Run with E2E_PYTHON=1.');
    test.setTimeout(180_000);
    const ws = await openItem(page, ID, TITLE);
    const item = await loadItem(page, ID);
    await ws.getByRole('combobox', { name: 'Language' }).selectOption('python');
    await setEditor(page, ws, 'Solution code', item.reference.python);
    await ws.getByRole('button', { name: 'Submit' }).click();
    await expect(verdict(ws)).toContainText('Accepted', { timeout: 150_000 });
  });
});
