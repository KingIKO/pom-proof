import { expect, test, type Page } from '@playwright/test';
import { discoverProblems, type DiscoveredProblem } from '../support/problems';
import { discoverQuestions, questionTitle } from '../support/questions';
import { openQuestion, rateByKeyboard } from '../support/review';
import { discoverTracks, type TrackFile } from '../support/tracks';
import { openWorkspace, submitStructured } from '../support/workspace';

type Structured = Parameters<typeof submitStructured>[1];
const tracks = discoverTracks();
const problems = discoverProblems();
const questions = discoverQuestions();
const isStructured = (problem: DiscoveredProblem): problem is Structured =>
  problem.kind === 'scenario' || problem.kind === 'diagnosis' || problem.kind === 'bug-report';

const trackProblems = (track: TrackFile) => track.sections.flatMap(({ problems: ids }) => ids);
const trackQuestions = (track: TrackFile) => track.sections.flatMap(({ questions: ids }) => ids ?? []);

// A structured problem on a track, solvable through the page's own controls.
const solvable = tracks.flatMap((track) => trackProblems(track).map((id) => ({ track, problem: problems.find((entry) => entry.id === id) })))
  .find((entry): entry is { track: TrackFile; problem: Structured } => entry.problem !== undefined && isStructured(entry.problem));
const rated = tracks.flatMap((track) => trackQuestions(track).map((id) => ({ track, question: questions.find((entry) => entry.id === id) })))
  .find((entry) => entry.question !== undefined);

const trackItem = (page: Page, title: string) => page.getByRole('listitem')
  .filter({ has: page.getByRole('link', { name: title, exact: true }) });
const trackSummary = (page: Page, title: string) => page.getByRole('listitem')
  .filter({ has: page.getByRole('heading', { level: 2, name: title, exact: true }) });

test('the four role tracks exist, each with a problem or question to practice', () => {
  expect(tracks.map(({ role }) => role)).toEqual(['manual-qa', 'automation', 'sdet', 'senior']);
  expect(tracks.filter((track) => trackProblems(track).length + trackQuestions(track).length === 0).map(({ role }) => role), 'empty tracks').toEqual([]);
  expect(solvable, 'a track lists a scenario, diagnosis or bug-report problem').toBeDefined();
  expect(rated, 'a track lists an interview question').toBeDefined();
});

test('the tracks page lists the four tracks in role order with their counts', async ({ page }) => {
  expect(tracks, 'track files').toHaveLength(4);
  await page.goto('tracks/');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(tracks.map(({ title }) => title));
  for (const track of tracks) {
    await expect(page.getByRole('link', { name: track.title, exact: true })).toHaveAttribute('href', `/pom-proof/tracks/${track.role}/`);
    const counts = [
      ...trackProblems(track).length ? [`0 of ${trackProblems(track).length} problems solved`] : [],
      ...trackQuestions(track).length ? [`0 of ${trackQuestions(track).length} questions at box 2+`] : [],
    ];
    await expect(trackSummary(page, track.title).locator('.track-counts span')).toHaveText(counts);
  }
});

test('a track page marks a problem Solved after a solve, and the tracks page counts it', async ({ page }) => {
  const { track, problem } = solvable!;
  const status = () => trackItem(page, problem.data.title).locator('.track-status');
  await page.goto(`tracks/${track.role}/`);
  await expect(page.getByRole('heading', { level: 1, name: track.title })).toBeVisible();
  await expect(status()).toHaveText('Unattempted');

  await openWorkspace(page, problem);
  await submitStructured(page, problem, 'reference');

  await page.goto(`tracks/${track.role}/`);
  await expect(status()).toHaveText('Solved');
  await page.reload();
  await expect(status()).toHaveText('Solved');

  await page.goto('tracks/');
  await expect(trackSummary(page, track.title)).toContainText(`1 of ${trackProblems(track).length} problems solved`);
});

test('a track page shows a question\'s review state after rating it', async ({ page }) => {
  const { track, question } = rated!;
  const status = () => trackItem(page, questionTitle(question!)).locator('.track-status');
  await page.goto(`tracks/${track.role}/`);
  await expect(status()).toHaveText('New');

  await openQuestion(page, question!);
  await rateByKeyboard(page, question!, 'solid');

  await page.goto(`tracks/${track.role}/`);
  await expect(status()).toHaveText('Box 1');
  await page.reload();
  await expect(status()).toHaveText('Box 1');
});
