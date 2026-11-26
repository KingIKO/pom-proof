import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { progressStorageKey } from '../../src/lib/contracts';
import { discoverProblems, root, type DiscoveredProblem } from '../support/problems';
import { openWorkspace, resultPanel, submitStructured } from '../support/workspace';

const problems = discoverProblems();
const find = <K extends DiscoveredProblem['kind']>(kind: K) => {
  const problem = problems.find((candidate) => candidate.kind === kind);
  if (!problem) throw new Error(`No ${kind} problem under content/problems`);
  return problem as DiscoveredProblem & { data: Extract<DiscoveredProblem['data'], { kind: K }> };
};
const bugReport = find('bug-report');
const code = find('code');

const rows = (page: Page) => page.getByRole('table', { name: 'Practice problems' }).locator('tbody tr');
const rowFor = (page: Page, title: string) => rows(page).filter({ has: page.getByRole('link', { name: title, exact: true }) });
const result = resultPanel;

async function solveBugReport(page: Page) {
  await openWorkspace(page, bugReport);
  await submitStructured(page, bugReport, 'reference');
}

async function replaceEditor(editor: Locator, source: string) {
  await editor.click();
  await editor.press('ControlOrMeta+a');
  await editor.page().keyboard.insertText(source);
  await expect(editor).toContainText(source.split('\n')[0]);
}

test('list filters are reflected in the URL and survive a reload', async ({ page }) => {
  await page.goto('');
  await expect(rows(page)).toHaveCount(problems.length);

  const kind = page.getByRole('combobox', { name: /^Kind\b/ });
  const difficulty = page.getByRole('combobox', { name: /^Difficulty\b/ });
  await kind.selectOption('sql');
  await expect(page).toHaveURL(/[?&]kind=sql(?:&|$)/);
  const sql = problems.filter((problem) => problem.kind === 'sql');
  await expect(rows(page)).toHaveCount(sql.length);
  await expect(rows(page).locator('.catalog-kind')).toHaveText(sql.map(() => 'SQL'));

  await difficulty.selectOption(sql[0].data.difficulty);
  await expect(page).toHaveURL(new RegExp(`[?&]difficulty=${sql[0].data.difficulty}(?:&|$)`));
  const both = sql.filter((problem) => problem.data.difficulty === sql[0].data.difficulty);

  await page.reload();
  await expect(kind).toHaveValue('sql');
  await expect(difficulty).toHaveValue(sql[0].data.difficulty);
  await expect(rows(page)).toHaveCount(both.length);
  await expect(rowFor(page, sql[0].data.title)).toHaveCount(1);

  await kind.selectOption('');
  await difficulty.selectOption('');
  await expect(page).not.toHaveURL(/[?&](?:kind|difficulty)=/);
  await expect(rows(page)).toHaveCount(problems.length);

  const search = page.getByRole('searchbox', { name: 'Search' });
  await search.fill(code.data.title);
  await expect(page).toHaveURL(/[?&]q=/);
  await expect(rows(page)).toHaveCount(1);
  await page.reload();
  await expect(search).toHaveValue(code.data.title);
  await expect(rows(page)).toHaveCount(1);
  await expect(rowFor(page, code.data.title)).toHaveCount(1);
});

test('a solve marks the problem Solved in the list and a miss marks it Attempted', async ({ page }) => {
  const diagnosis = find('diagnosis');
  await page.goto('');
  await expect(rowFor(page, bugReport.data.title)).toHaveCount(1);
  await expect(rowFor(page, bugReport.data.title).locator('.catalog-status')).toHaveText('');
  await expect(rowFor(page, diagnosis.data.title).locator('.catalog-status')).toHaveText('');

  await solveBugReport(page);

  await openWorkspace(page, diagnosis);
  await submitStructured(page, diagnosis, 'decoy');

  await page.getByRole('link', { name: 'Back to practice' }).click();
  await expect(rowFor(page, bugReport.data.title).locator('.catalog-status')).toHaveText('Solved');
  await expect(rowFor(page, diagnosis.data.title).locator('.catalog-status')).toHaveText('Attempted');
  await page.reload();
  await expect(rowFor(page, bugReport.data.title).locator('.catalog-status')).toHaveText('Solved');
});

// The plan: the Editorial tab opens after the first submission or an explicit "Show editorial".
test.describe('editorial access', () => {
  const body = readFileSync(join(root, 'content', 'editorials', `${bugReport.slug}.md`), 'utf8').split(/^---\r?$/m)[2] ?? '';
  const sentence = body.trim().split(/\r?\n/).at(-1)!.split('. ')[0].trim();
  const pane = (page: Page) => page.getByRole('group', { name: 'Reading pane' });
  const showEditorial = (page: Page) => pane(page).getByRole('button', { name: 'Show editorial', exact: true });
  const editorialTab = (page: Page) => pane(page).getByRole('button', { name: 'Editorial', exact: true });
  const problemHeading = (page: Page) => page.getByRole('heading', { level: 2, name: 'Problem' });

  test('a fresh page hides the editorial content and Show editorial reveals it on demand', async ({ page }) => {
    expect(sentence.length, 'the editorial has text to look for').toBeGreaterThan(20);
    const editorialText = page.getByText(sentence, { exact: false });
    await openWorkspace(page, bugReport);
    await expect(problemHeading(page)).toBeVisible();
    await expect(editorialText).toBeHidden();
    await expect(showEditorial(page)).toHaveAttribute('aria-pressed', 'false');

    await showEditorial(page).click();
    await expect(editorialText).toBeVisible();
    await expect(problemHeading(page)).toBeHidden();
    await expect(editorialTab(page)).toHaveAttribute('aria-pressed', 'true');

    await pane(page).getByRole('button', { name: 'Problem', exact: true }).click();
    await expect(problemHeading(page)).toBeVisible();
    await expect(editorialText).toBeHidden();
  });

  test('after a submission the editorial is offered directly and still is after a reload', async ({ page }) => {
    const editorialText = page.getByText(sentence, { exact: false });
    await solveBugReport(page);
    await expect(editorialTab(page)).toBeVisible();
    await expect(showEditorial(page)).toHaveCount(0);
    await expect(editorialText).toBeHidden();
    await editorialTab(page).click();
    await expect(editorialText).toBeVisible();

    await page.reload();
    await expect(problemHeading(page)).toBeVisible();
    await expect(editorialTab(page)).toBeVisible();
    await expect(showEditorial(page)).toHaveCount(0);
    await editorialTab(page).click();
    await expect(editorialText).toBeVisible();
  });
});

test('progress exports, resets after a confirm, and imports', async ({ page }) => {
  await solveBugReport(page);
  await page.goto('progress/');
  const solved = page.getByText(new RegExp(`^\\d+ of ${problems.length} solved$`));
  await expect(solved).toHaveText(`1 of ${problems.length} solved`);
  const attempts = page.getByRole('table', { name: 'Recent attempts' });
  await expect(attempts.getByRole('link', { name: bugReport.data.title })).toBeVisible();

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe('pom-proof-progress.json');
  const exported = readFileSync(await file.path(), 'utf8');
  expect(JSON.parse(exported)).toMatchObject({ version: 1, attempts: [{ problemId: bugReport.id, score: 1 }] });
  await expect(page.getByRole('status')).toHaveText('Progress exported.');

  const dialog = page.getByRole('dialog', { name: 'Reset progress?' });
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Keep progress' }).click();
  await expect(dialog).toBeHidden();
  await expect(solved).toHaveText(`1 of ${problems.length} solved`);

  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await dialog.getByRole('button', { name: 'Reset progress' }).click();
  await expect(page.getByRole('status')).toHaveText('Progress reset.');
  await page.reload();
  await expect(solved).toHaveText(`0 of ${problems.length} solved`);
  await expect(page.getByText('No attempts yet')).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), progressStorageKey)).toBeNull();

  const chooseFile = async (name: string, contents: string) => {
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Import' }).click();
    await (await chooser).setFiles({ name, mimeType: 'application/json', buffer: Buffer.from(contents) });
  };
  await chooseFile('pom-proof-progress.json', exported);
  await expect(page.getByRole('status')).toHaveText('Imported 1 attempt.');
  await expect(solved).toHaveText(`1 of ${problems.length} solved`);
  await page.reload();
  await expect(solved).toHaveText(`1 of ${problems.length} solved`);

  await chooseFile('other.json', JSON.stringify({ version: 2, attempts: [] }));
  await expect(page.getByRole('status')).toHaveText(/unsupported/);
  await expect(solved).toHaveText(`1 of ${problems.length} solved`);
});

test('a runaway loop stops at the time limit while the page stays responsive', async ({ page }) => {
  await openWorkspace(page, code);
  const editor = page.getByRole('textbox', { name: 'Solution code' });
  await replaceEditor(editor, `export function ${code.data.exportName}(attempts) {\n  while (true) {}\n}`);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  const running = page.getByRole('status').filter({ hasText: /^Running/ });
  await expect(running).toBeVisible();

  // The loop runs in a worker: while it spins, typing still reaches the editor on the main thread.
  await editor.press('ControlOrMeta+End');
  await page.keyboard.insertText('\n// typed during the run');
  await expect(editor).toContainText('// typed during the run');
  await expect(running).toBeVisible();

  await expect(result(page, 'Not graded')).toHaveText(/Stopped after 2 seconds\. Look for a loop that never ends\./);
  await expect(running).toBeHidden();

  await replaceEditor(editor, code.data.reference.source);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: /^(\d+) of \1 visible checks passed$/ })).toBeVisible();
});

test('Ctrl+Enter in the code editor runs the code without editing it', async ({ page }) => {
  await openWorkspace(page, code);
  const editor = page.getByRole('textbox', { name: 'Solution code' });
  await replaceEditor(editor, code.data.reference.source.trimEnd());
  const lines = await editor.locator('.cm-line').count();
  const passed = page.getByRole('status').filter({ hasText: /^(\d+) of \1 visible checks passed$/ });
  await expect(passed).toHaveCount(0);

  await editor.press('Control+Enter');
  await expect(passed).toBeVisible();
  await expect(editor.locator('.cm-line')).toHaveCount(lines);
});
