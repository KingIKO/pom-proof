import { expect, test, type Page } from '@playwright/test';
import { discoverQuestions, questionTitle, questionTopics, type DiscoveredQuestion } from '../support/questions';
import { expandQuestion, openQuestion, questionRow, questionsInListOrder, rateByKeyboard, reviewState, storedCards } from '../support/review';

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

type FollowUp = { question: string; answer: string };
const followUps = (question: DiscoveredQuestion) => (question.frontmatter.followUps ?? []) as FollowUp[];
const sample = questions.find((question) => followUps(question).length > 0 && typeof question.frontmatter.trap === 'string');

test('expanding a bank card shows the answer inline, rates it there, and links to its page', async ({ page }) => {
  expect(sample, 'a question with follow-ups and a trap').toBeDefined();
  const question = sample!;
  await page.clock.install({ time: start });
  await page.goto('questions/');
  await expect(reviewState(page, question)).toHaveText('New');
  // The title is a heading in the card, not a link; the card's only page link is "Open page".
  await expect(questionRow(page, question).getByRole('link', { name: questionTitle(question), exact: true })).toHaveCount(0);

  const card = await expandQuestion(page, question);
  await expect(card.getByText('What they look for', { exact: true })).toBeVisible();
  for (const item of question.frontmatter.looksFor as string[]) await expect(card.getByText(item, { exact: true }).first()).toBeVisible();
  await expect(card.getByRole('complementary', { name: 'The trap' })).toContainText(String(question.frontmatter.trap));
  await expect(card.getByText("They'll ask next", { exact: true })).toBeVisible();

  const [followUp] = followUps(question);
  const followUpAnswer = card.getByText(followUp.answer, { exact: true });
  await expect(followUpAnswer).toBeHidden();
  await card.getByText(followUp.question, { exact: true }).click();
  await expect(followUpAnswer).toBeVisible();

  await card.getByRole('group', { name: 'Rate your answer' }).getByRole('button', { name: 'Solid', exact: true }).click();
  await expect(reviewState(page, question)).toHaveText('Box 1');
  await expect(card.getByRole('group', { name: 'Rate your answer' }).getByRole('button', { name: 'Solid', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect((await storedCards(page))[question.id], 'the inline rating is stored like a page rating').toMatchObject({ box: 1, seen: 1, last: 'solid' });
  await page.reload();
  await expect(reviewState(page, question)).toHaveText('Box 1');

  const card2 = await expandQuestion(page, question);
  await card2.getByRole('link', { name: 'Open page', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/pom-proof/${question.path}$`));
  await expect(page.getByRole('heading', { level: 1, name: questionTitle(question) })).toBeVisible();
  // The question page keeps its recall gate.
  await expect(page.getByText(String(question.frontmatter.oneLine), { exact: true })).toBeHidden();
  await expect(page.getByText('Show answer')).toBeVisible();
});

test('rapidly double-clicking Solid rates a bank card only once per visit', async ({ page }) => {
  const [question] = questions;
  await page.clock.install({ time: start });
  await page.goto(`questions/#${question.slug}`);
  const card = questionRow(page, question);
  const ratings = card.getByRole('group', { name: 'Rate your answer' });
  const solid = ratings.getByRole('button', { name: 'Solid', exact: true });

  await solid.dblclick({ delay: 10 });
  expect((await storedCards(page))[question.id]).toMatchObject({ box: 1, seen: 1, last: 'solid' });
  await expect(reviewState(page, question)).toHaveText('Box 1');
  await expect(solid).toHaveAttribute('aria-pressed', 'true');
  for (const button of await ratings.getByRole('button').all()) await expect(button).toBeDisabled();
  await expect(card.getByRole('status')).toHaveText('Rated Solid. Next review in 1 day.');

  await page.clock.fastForward(day);
  await page.reload();
  await expect(solid).toBeEnabled();
  await solid.click();
  expect((await storedCards(page))[question.id]).toMatchObject({ box: 2, seen: 2, last: 'solid' });
  await expect(card.getByRole('status')).toHaveText('Rated Solid. Next review in 3 days.');
});

test('a deep link opens its card in the list', async ({ page }) => {
  const question = questions.at(-1)!;
  await page.goto(`questions/#${question.slug}`);
  const card = questionRow(page, question);
  await expect(card.locator('details').first()).toHaveAttribute('open', '');
  await expect(card.getByText(String(question.frontmatter.oneLine), { exact: true })).toBeVisible();
  await expect(card.getByRole('heading', { level: 2, name: questionTitle(question), exact: true })).toBeInViewport();
});

/**
 * A word of at least nine letters that appears in one question's chosen field and nowhere else: not in
 * its other fields and not in any other question. Searching it can only match through that field.
 */
function wordOnlyIn(field: 'trap' | 'body') {
  const fields = (question: DiscoveredQuestion) => {
    const { title, oneLine, looksFor, trap } = question.frontmatter;
    return {
      trap: String(trap ?? ''),
      body: question.body.replace(/\]\([^)]*\)|https?:\/\/\S+/g, ' '),
      rest: [title, oneLine, ...((looksFor ?? []) as string[]), ...followUps(question).flatMap(({ question: ask, answer }) => [ask, answer])].join(' '),
    };
  };
  const all = questions.map((question) => ({ question, text: fields(question) }));
  for (const { question, text } of all) {
    const own = [text.rest, field === 'trap' ? text.body : text.trap].join(' ').toLowerCase();
    for (const word of new Set(text[field].match(/[A-Za-z]{9,}/g) ?? [])) {
      const term = word.toLowerCase();
      // Topic chip labels are searchable too.
      if (own.includes(term) || questionTopics.some((topic) => topic.replace(/-/g, ' ').includes(term))) continue;
      if (all.some((other) => other.question !== question
        && [other.text.trap, other.text.body, other.text.rest].join(' ').toLowerCase().includes(term))) continue;
      return { question, term };
    }
  }
  return undefined;
}

for (const field of ['trap', 'body'] as const) {
  test(`search finds a question by a word only its ${field} has`, async ({ page }) => {
    const match = wordOnlyIn(field);
    expect(match, `a word unique to one question's ${field}`).toBeDefined();
    await page.goto('questions/');
    const search = page.getByRole('searchbox', { name: `Search ${questions.length} questions` });
    await search.fill(match!.term);
    await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe(match!.term);
    await expect(page.getByRole('list', { name: 'Questions' }).getByRole('listitem').filter({ visible: true })
      .filter({ has: page.getByRole('heading', { level: 2 }) })).toHaveCount(1);
    await expect(questionRow(page, match!.question)).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: /^\d+ shown$/ })).toHaveText('1 shown');
  });
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('a card and its first follow-up still expand', async ({ page }) => {
    expect(sample, 'a question with follow-ups').toBeDefined();
    await page.goto('questions/');
    const card = await expandQuestion(page, sample!);
    const [followUp] = followUps(sample!);
    await expect(card.getByText(followUp.answer, { exact: true })).toBeHidden();
    await card.getByText(followUp.question, { exact: true }).click();
    await expect(card.getByText(followUp.answer, { exact: true })).toBeVisible();
    await expect(card.getByRole('link', { name: 'Open page', exact: true })).toHaveAttribute('href', `/pom-proof/${sample!.path}`);
  });
});

/** After a session navigation, waits for the question page's key handler like openQuestion does. */
async function openQuestionReady(page: Page) {
  await expect(page.getByText('Space', { exact: true })).toBeVisible();
}
