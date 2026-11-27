import { expect, test, type Page } from '@playwright/test';
import { fullMarksText, jsSolution, locatorSource, tableRows, uiProblemPerKind, type ProblemOf } from '../support/answers';
import { discoverProblems, type DiscoveredProblem } from '../support/problems';
import { discoverQuestions, questionTitle } from '../support/questions';
import { expandQuestion, reviewState } from '../support/review';
import { discoverTracks } from '../support/tracks';
import { answerStructured, openWorkspace, replaceEditor, resultPanel } from '../support/workspace';

// Runs against the local preview by default and against a deployed site when BASE_URL is set
// (playwright.config.ts). Every answer goes in through the page's own controls, never the grade hook.
const problems = discoverProblems();
const questions = discoverQuestions();
const tracks = discoverTracks();
const picks = uiProblemPerKind(problems);

const workspace = (page: Page) => page.getByRole('region', { name: 'Workspace' });
const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Main' });
const listRow = (page: Page, title: string) => page.getByRole('table', { name: 'Practice problems' }).locator('tbody tr')
  .filter({ has: page.getByRole('link', { name: title, exact: true }) });
const solvedCount = (page: Page) => page.getByText(new RegExp(`^\\d+ of ${problems.length} solved$`));

/** Fills the test-design table row by row with the table reference, adding rows with the Add row button. */
async function fillTable(page: Page, problem: ProblemOf<'test-design'>) {
  const params = problem.data.params!;
  const rows = tableRows(problem.data)!;
  const table = workspace(page).getByRole('table', { name: 'Test rows' });
  for (const [index, row] of rows.entries()) {
    if (index > 0) await workspace(page).getByRole('button', { name: 'Add row', exact: true }).click();
    for (const [column, param] of params.entries()) {
      const control = table.getByLabel(`${param.label}, row ${index + 1}`, { exact: true });
      const value = String(row.args[column]);
      if (param.type === 'boolean' || param.type === 'enum') await control.selectOption(value);
      else await control.fill(value);
    }
    await table.getByLabel(`Expected result, row ${index + 1}`, { exact: true }).fill(JSON.stringify(row.expected));
  }
  await expect(table.locator('tbody tr')).toHaveCount(rows.length);
}

async function answerInUi(page: Page, problem: DiscoveredProblem) {
  switch (problem.data.kind) {
    case 'scenario':
    case 'diagnosis':
    case 'bug-report':
      await answerStructured(page, problem.data, problem.data.reference);
      break;
    case 'test-design':
      await fillTable(page, problem as ProblemOf<'test-design'>);
      break;
    case 'locator': {
      const input = workspace(page).getByRole('textbox', { name: 'Locator expression' });
      const source = locatorSource(problem.data.reference);
      await input.pressSequentially(source);
      await expect(input).toHaveValue(source);
      break;
    }
    case 'sql':
      await replaceEditor(workspace(page).getByRole('textbox', { name: 'SQL query' }), problem.data.reference.query);
      break;
    case 'code':
      await expect(workspace(page).getByRole('combobox', { name: /^Language\b/ })).toHaveValue('js');
      await replaceEditor(workspace(page).getByRole('textbox', { name: 'Solution code' }), jsSolution(problem.data)!);
      break;
  }
  await workspace(page).getByRole('button', { name: 'Submit', exact: true }).click();
}

for (const problem of picks) {
  test(`${problem.kind}: ${problem.id} solved through the page scores full marks and shows Solved in the list`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await openWorkspace(page, problem);
    await answerInUi(page, problem);
    await expect(resultPanel(page, 'Pass')).toHaveText(fullMarksText(problem));

    await page.getByRole('link', { name: 'Back to practice' }).click();
    await expect(listRow(page, problem.data.title)).toHaveCount(1);
    await expect(listRow(page, problem.data.title).locator('.catalog-status')).toHaveText('Solved');

    await mainNav(page).getByRole('link', { name: 'Progress', exact: true }).click();
    await expect(solvedCount(page)).toHaveText(`1 of ${problems.length} solved`);
    expect(errors, 'page errors').toEqual([]);
  });
}

// A question listed on a track, so the track page can show the rating too.
const onTrack = tracks.flatMap((track) => track.sections.flatMap(({ questions: ids }) => ids ?? [])
  .map((id) => ({ track, question: questions.find((entry) => entry.id === id) })))
  .find((entry) => entry.question !== undefined);

test('a question revealed and rated through the page shows on the list, its track and the progress page', async ({ page }) => {
  expect(onTrack, 'a track lists an interview question').toBeDefined();
  const { track } = onTrack!;
  const question = onTrack!.question!;
  const title = questionTitle(question);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('');
  await mainNav(page).getByRole('link', { name: 'Questions', exact: true }).click();
  await expect(reviewState(page, question)).toHaveText('New');
  // The bank shows the answer inline; "Open page" leads to the question page and its recall gate.
  const card = await expandQuestion(page, question);
  await card.getByRole('link', { name: 'Open page', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();

  const oneLine = page.getByText(String(question.frontmatter.oneLine), { exact: true });
  await expect(oneLine).toBeHidden();
  await page.getByText('Show answer').click();
  await expect(oneLine).toBeVisible();
  await page.getByRole('group', { name: 'Rate your answer' }).getByRole('button', { name: 'Solid', exact: true }).click();
  await expect(page).toHaveURL(/\/pom-proof\/questions\/(?:\?.*)?$/);
  await expect(reviewState(page, question)).toHaveText('Box 1');

  await mainNav(page).getByRole('link', { name: 'Tracks', exact: true }).click();
  await page.getByRole('link', { name: track.title, exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: track.title })).toBeVisible();
  const item = page.getByRole('listitem').filter({ has: page.getByRole('link', { name: title, exact: true }) });
  await expect(item.locator('.track-status')).toHaveText('Box 1');

  await mainNav(page).getByRole('link', { name: 'Progress', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Review queue' }).getByText(/due for review/))
    .toHaveText(`0 due for review, ${questions.length - 1} new`);
  await expect(solvedCount(page)).toHaveText(`0 of ${problems.length} solved`);
  expect(errors, 'page errors').toEqual([]);
});
