import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { progressStorageKey } from '../../src/lib/contracts';
import { kindLabel } from '../../src/lib/labels';
import { discoverProblems, type DiscoveredProblem } from '../support/problems';
import { discoverQuestions } from '../support/questions';
import { openQuestion, rateByKeyboard, reviewState, reviewStorageKey, storedCards } from '../support/review';
import { openWorkspace, submitStructured } from '../support/workspace';

type Structured = Parameters<typeof submitStructured>[1];
const problems = discoverProblems();
const questions = discoverQuestions();
const bugReport = problems.find((problem): problem is Structured & DiscoveredProblem => problem.kind === 'bug-report')!;
const bugReports = problems.filter(({ kind }) => kind === 'bug-report').length;
const question = questions[0];
const start = new Date('2026-11-26T09:00:00.000Z');
const minute = 60_000;
const day = 24 * 60 * minute;
// The page's own format for shares; the expected values are worked out from 2G's definition.
const percent = (share: number) => new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 2 }).format(share);

/** The readiness table's cells for one round: [progress, readiness]. */
const readiness = (page: Page, round: string) => page.getByRole('table', { name: 'Readiness by round' }).getByRole('row')
  .filter({ has: page.getByRole('rowheader', { name: round, exact: true }) }).getByRole('cell');
const queue = (page: Page) => page.getByRole('region', { name: 'Review queue' }).getByText(/due for review/);

async function openProgress(page: Page) {
  await page.goto('progress/');
  await expect(page.getByRole('heading', { level: 2, name: 'Round readiness' })).toBeVisible();
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
}

test('there is a bug-report problem and a question to practice', () => {
  expect(bugReport, 'a bug-report problem').toBeDefined();
  expect(question, 'a question').toBeDefined();
});

test('round readiness changes after a solve and survives a reload', async ({ page }) => {
  const round = kindLabel['bug-report'];
  await openProgress(page);
  await expect(readiness(page, round)).toHaveText([`0 of ${bugReports} solved`, percent(0)]);

  await openWorkspace(page, bugReport);
  await submitStructured(page, bugReport, 'reference');

  await openProgress(page);
  await expect(readiness(page, round)).toHaveText([`1 of ${bugReports} solved`, percent(1 / bugReports)]);
  await page.reload();
  await expect(readiness(page, round)).toHaveText([`1 of ${bugReports} solved`, percent(1 / bugReports)]);
});

test('question readiness counts a card only once it reaches box 2, and the review queue follows due cards', async ({ page }) => {
  await page.clock.install({ time: start });
  const round = 'Interview questions';
  const total = questions.length;
  await openProgress(page);
  await expect(readiness(page, round)).toHaveText([`0 of ${total} at box 2+`, percent(0)]);
  await expect(queue(page)).toHaveText(`0 due for review, ${total} new`);

  await openQuestion(page, question);
  await rateByKeyboard(page, question, 'solid');
  await openProgress(page);
  // Box 1 is not enough.
  await expect(readiness(page, round)).toHaveText([`0 of ${total} at box 2+`, percent(0)]);
  await expect(queue(page)).toHaveText(`0 due for review, ${total - 1} new`);

  await page.clock.fastForward(day + minute);
  await page.reload();
  await expect(queue(page)).toHaveText(`1 due for review, ${total - 1} new`);

  await openQuestion(page, question);
  await rateByKeyboard(page, question, 'solid');
  await openProgress(page);
  await expect(readiness(page, round)).toHaveText([`1 of ${total} at box 2+`, percent(1 / total)]);
  await expect(queue(page)).toHaveText(`0 due for review, ${total - 1} new`);
});

test('export carries review state and import restores it', async ({ page }) => {
  await openQuestion(page, question);
  await rateByKeyboard(page, question, 'solid');
  await openWorkspace(page, bugReport);
  await submitStructured(page, bugReport, 'reference');

  await openProgress(page);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe('pom-proof-progress.json');
  const exported = readFileSync(await file.path(), 'utf8');
  const data = JSON.parse(exported);
  expect(data).toMatchObject({ version: 1, attempts: [{ problemId: bugReport.id, score: 1 }] });
  expect(data.review, 'the export has the rated card').toEqual({ [question.id]: expect.objectContaining({ box: 1, seen: 1, last: 'solid' }) });

  await page.evaluate((keys) => keys.forEach((key) => localStorage.removeItem(key)), [progressStorageKey, reviewStorageKey]);
  await page.reload();
  await expect(readiness(page, kindLabel['bug-report'])).toHaveText([`0 of ${bugReports} solved`, percent(0)]);

  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Import' }).click();
  await (await chooser).setFiles({ name: 'pom-proof-progress.json', mimeType: 'application/json', buffer: Buffer.from(exported) });
  await expect(page.getByRole('status').filter({ hasText: /^Imported/ })).toHaveText('Imported 1 attempt.');
  await expect(readiness(page, kindLabel['bug-report'])).toHaveText([`1 of ${bugReports} solved`, percent(1 / bugReports)]);
  expect(await storedCards(page)).toEqual(data.review);

  await page.goto('questions/');
  await expect(reviewState(page, question)).toHaveText('Box 1');
});

test('Reset clears attempts and review state only after a confirm', async ({ page }) => {
  await openQuestion(page, question);
  await rateByKeyboard(page, question, 'solid');
  await openWorkspace(page, bugReport);
  await submitStructured(page, bugReport, 'reference');
  await openProgress(page);

  const dialog = page.getByRole('dialog', { name: 'Reset progress?' });
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await dialog.getByRole('button', { name: 'Keep progress' }).click();
  await expect(dialog).toBeHidden();
  await expect(readiness(page, kindLabel['bug-report'])).toHaveText([`1 of ${bugReports} solved`, percent(1 / bugReports)]);
  expect(Object.keys(await storedCards(page))).toEqual([question.id]);

  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await dialog.getByRole('button', { name: 'Reset progress' }).click();
  await expect(page.getByRole('status').filter({ hasText: /^Progress reset/ })).toBeVisible();
  await page.reload();
  await expect(readiness(page, kindLabel['bug-report'])).toHaveText([`0 of ${bugReports} solved`, percent(0)]);
  expect(await storedCards(page), 'review cards after Reset').toEqual({});

  await page.goto('questions/');
  await expect(reviewState(page, question)).toHaveText('New');
});
