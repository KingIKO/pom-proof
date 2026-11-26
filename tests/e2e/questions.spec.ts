import { expect, test, type Page } from '@playwright/test';
import { discoverQuestions, questionTopics } from '../support/questions';
import { openQuestion, questionRow, questionsInListOrder, rateByKeyboard, reviewState, storedCards } from '../support/review';

const questions = questionsInListOrder(discoverQuestions());
const start = new Date('2026-11-26T09:00:00.000Z');
const minute = 60_000;
const day = 24 * 60 * minute;
// A topic with at least three questions, so a review session has a due card, a seen card and a new one.
const topic = questionTopics.find((name) => questions.filter(({ folder }) => folder === name).length >= 3);
const inTopic = questions.filter(({ folder }) => folder === topic);

test('there are questions to review', () => {
  expect(questions.length, 'question files').toBeGreaterThan(1);
  expect(topic, 'a topic with three or more questions').toBeDefined();
});

test('Space reveals the answer, number keys rate it, and ratings survive a reload', async ({ page }) => {
  await page.clock.install({ time: start });
  const [solid, missed] = questions;

  await page.goto('questions/');
  await expect(questionRow(page, solid)).toHaveCount(1);
  await expect(reviewState(page, solid)).toHaveText('New');
  await expect(reviewState(page, missed)).toHaveText('New');

  await openQuestion(page, solid);
  await rateByKeyboard(page, solid, 'solid');
  await expect(page).toHaveURL(/\/pom-proof\/questions\/$/);
  await expect(reviewState(page, solid)).toHaveText('Box 1');

  await openQuestion(page, missed);
  await rateByKeyboard(page, missed, 'missed');
  await expect(reviewState(page, missed)).toHaveText('Box 0');

  const cards = await storedCards(page);
  expect(cards[solid.id], 'a first solid goes to box 1, due a day later').toMatchObject({ box: 1, seen: 1, last: 'solid' });
  expect(Date.parse(cards[solid.id].due) - start.getTime()).toBeGreaterThanOrEqual(day);
  expect(Date.parse(cards[solid.id].due) - start.getTime()).toBeLessThan(day + 10 * minute);
  expect(cards[missed.id], 'a missed card goes to box 0').toMatchObject({ box: 0, seen: 1, last: 'missed' });

  await page.reload();
  await expect(reviewState(page, solid)).toHaveText('Box 1');
  await expect(reviewState(page, missed)).toHaveText('Box 0');
  await expect(reviewState(page, questions[2])).toHaveText('New');

  // The missed card comes back after ten minutes; the solid one waits a day.
  await page.clock.fastForward(11 * minute);
  await page.reload();
  await expect(reviewState(page, missed)).toHaveText('Due');
  await expect(reviewState(page, solid)).toHaveText('Box 1');
});

test('Review due questions shows due cards first, then new ones, and skips cards not yet due', async ({ page }) => {
  await page.clock.install({ time: start });
  // The list sorts by title, so the due card is the last one and the seen card is the first.
  const seen = inTopic[0];
  const due = inTopic.at(-1)!;
  const firstNew = inTopic[1];
  expect(new Set([seen.id, due.id, firstNew.id]).size, 'three different questions').toBe(3);

  await openQuestion(page, due);
  await rateByKeyboard(page, due, 'missed');
  await openQuestion(page, seen);
  await rateByKeyboard(page, seen, 'solid');
  await page.clock.fastForward(11 * minute);

  await page.goto(`questions/?topic=${topic}`);
  await expect(page.getByRole('list', { name: 'Questions' }).getByRole('listitem').filter({ visible: true })).toHaveCount(inTopic.length);
  await expect(reviewState(page, due)).toHaveText('Due');
  await expect(reviewState(page, seen)).toHaveText('Box 1');
  await expect(reviewState(page, firstNew)).toHaveText('New');

  await page.getByRole('button', { name: 'Review due questions' }).click();
  await expect(page).toHaveURL(new RegExp(`/questions/${due.id}/\\?(?:.*&)?review=1`));
  await openQuestionReady(page);
  await rateByKeyboard(page, due, 'solid');

  // Next is the first new question in list order; the seen card is not due, so it is skipped.
  await expect(page).toHaveURL(new RegExp(`/questions/${firstNew.id}/\\?`));
  await expect(page.getByRole('heading', { level: 1, name: String(firstNew.frontmatter.title) })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('topic'), 'the session keeps the topic filter').toBe(topic);
});

/** After a session navigation, waits for the question page's key handler like openQuestion does. */
async function openQuestionReady(page: Page) {
  await expect(page.getByText('Space', { exact: true })).toBeVisible();
}
